'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { getUserData } from '@/entities/user'
import { createContaAzulClient, type ContaAzulCustomerRaw } from '@/features/integrations/contaazul'
import { logger } from '@/shared/lib/logger'
import { createActivityLog } from '@/features/logs'
import { ActionType } from '@/shared/config/enums'
import { mapContaAzulRawToUpsert } from '@/features/integrations/contaazul/services/contaazul-persons-mapper.service'
import { updateIntegrationSyncTime } from '../lib/update-integration-sync'

interface SyncResult {
  success: boolean
  synced?: number
  created?: number
  updated?: number
  errors?: number
  message?: string
}

export async function syncContaAzulPersons(): Promise<SyncResult> {
  const userData = await getUserData()

  if (!userData?.tenant_id) {
    return {
      success: false,
      message: 'Unauthorized: No tenant_id found',
    }
  }

  try {
    logger.info('Starting ContaAzul persons sync with user context', {
      tenantId: userData.tenant_id,
      userId: userData.id,
      userRole: userData.role,
    })

    logger.info('Starting ContaAzul persons sync', {
      tenantId: userData.tenant_id,
    })

    const contaAzulClient = await createContaAzulClient(userData.tenant_id)
    const supabase = await createClient()

    const customers = await contaAzulClient.getCustomers()

    logger.info('Fetched customers from Conta Azul', {
      count: customers.length,
      tenantId: userData.tenant_id,
    })

    const allPersons: ContaAzulCustomerRaw[] = customers.map((customer) => ({
      id: customer.id,
      nome: customer.name,
      nome_razao_social: customer.name,
      documento: customer.documentNumber,
      cpf_cnpj: customer.documentNumber,
      email: customer.email,
      telefone: customer.phone,
      phone: customer.phone,
      endereco: customer.address
        ? {
            logradouro: customer.address.street,
            numero: customer.address.number,
            complemento: customer.address.complement,
            bairro: customer.address.neighborhood,
            cep: customer.address.postalCode,
            cidade_id: customer.address.cityId ? Number(customer.address.cityId) : undefined,
          }
        : undefined,
      address: customer.address,
    }))

    const now = new Date().toISOString()
    const personsData = allPersons
      .map((pessoa) => {
        const upsert = mapContaAzulRawToUpsert(pessoa, userData.tenant_id, now)
        if (!upsert) {
          logger.warn('Person without ID, skipping', { pessoa })
        }
        return upsert
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)

    const uniquePersonsMap = new Map<string, (typeof personsData)[0]>()
    personsData.forEach((person) => {
      uniquePersonsMap.set(person.conta_azul_id, person)
    })
    const uniquePersonsData = Array.from(uniquePersonsMap.values())

    const duplicatesCount = personsData.length - uniquePersonsData.length
    if (duplicatesCount > 0) {
      logger.warn('Found and removed duplicate persons', {
        tenantId: userData.tenant_id,
        total: personsData.length,
        unique: uniquePersonsData.length,
        duplicates: duplicatesCount,
      })
    }

    const { error: upsertError } = await supabase
      .from('contaazul_pessoas')
      .upsert(uniquePersonsData, {
        onConflict: 'tenant_id,conta_azul_id',
        ignoreDuplicates: false,
      })

    if (upsertError) {
      logger.error('Failed to upsert persons', upsertError, {
        tenantId: userData.tenant_id,
        count: uniquePersonsData.length,
      })
      return {
        success: false,
        message: `Erro ao salvar pessoas: ${upsertError.message}`,
      }
    }

    const contaAzulIds = uniquePersonsData.map((person) => person.conta_azul_id)
    const { error: inactivateError, count: inactivatedCount } = await supabase
      .from('contaazul_pessoas')
      .update({ is_active: false, updated_at: now })
      .eq('tenant_id', userData.tenant_id)
      .eq('is_active', true)
      .not('conta_azul_id', 'in', `(${contaAzulIds.join(',')})`)

    if (inactivateError) {
      logger.warn('Error marking persons as inactive', {
        tenantId: userData.tenant_id,
        error: inactivateError,
      })
    } else if (inactivatedCount && inactivatedCount > 0) {
      logger.info('Persons marked as inactive', {
        tenantId: userData.tenant_id,
        count: inactivatedCount,
      })
    }

    const created = uniquePersonsData.length
    const updated = 0
    const errors = 0

    await createActivityLog({
      action_type: ActionType.SYNC_CONTAAZUL_PESSOAS,
      entity_type: 'contaazul_pessoa',
      entity_id: userData.tenant_id,
      new_value: {
        total: allPersons.length,
        created,
        updated,
        inactivated: inactivatedCount || 0,
        errors,
      },
    })

    await updateIntegrationSyncTime(userData.tenant_id, 'CONTA_AZUL')

    logger.info('ContaAzul persons sync completed', {
      tenantId: userData.tenant_id,
      total: allPersons.length,
      created,
      updated,
      inactivated: inactivatedCount || 0,
      errors,
    })

    return {
      success: true,
      synced: allPersons.length,
      created,
      updated,
      errors,
      message: `Sincronizado: ${created} criados, ${updated} atualizados, ${errors} erros`,
    }
  } catch (error) {
    logger.error('ContaAzul persons sync failed', error, {
      tenantId: userData.tenant_id,
    })

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error during sync',
    }
  }
}
