'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { getUserData, requireWritePermission } from '@/entities/user'
import { createContaAzulClient } from '@/features/integrations/contaazul'
import { logger } from '@/shared/lib/logger'
import { revalidatePath } from 'next/cache'
import { ROUTES } from '@/shared/config/constants'
import type { SyncServicesResult } from '@/features/integrations/contaazul'
import { mapContaAzulServiceToUpsert } from '@/features/integrations/contaazul/services/contaazul-services-mapper.service'
import { createActivityLog } from '@/features/logs'
import { ActionType } from '@/shared/config/enums'
import { updateIntegrationSyncTime } from '../lib/update-integration-sync'

export async function syncContaAzulServices(): Promise<SyncServicesResult> {
  let tenantId: string | undefined

  try {
    const { id: userId, tenant_id, role } = await getUserData()
    tenantId = tenant_id
    requireWritePermission(role)

    if (!tenantId) {
      throw new Error('Tenant not found for current user')
    }

    logger.info('Starting Conta Azul services sync', { tenantId, userId })

    const contaAzulClient = await createContaAzulClient(tenantId)

    logger.info('Fetching provided services from Conta Azul API', { tenantId })
    const services = await contaAzulClient.getProvidedServices()

    if (!Array.isArray(services)) {
      logger.error('Services response is not an array', {
        tenantId,
        responseType: typeof services,
        response: services,
      })
      return {
        success: false,
        error: 'Resposta invalida da API do Conta Azul. Verifique os logs.',
      }
    }

    logger.info('Services fetched from Conta Azul', {
      tenantId,
      count: services.length,
    })

    if (services.length === 0) {
      logger.warn('No services found in Conta Azul', { tenantId })
      return {
        success: true,
        count: 0,
        lastSyncedAt: new Date().toISOString(),
      }
    }

    const supabase = await createClient()
    const now = new Date().toISOString()
    const ensuredTenantId = tenantId as string

    const upsertCandidates = services
      .map((service) => mapContaAzulServiceToUpsert(service, ensuredTenantId, now))
      .filter((service) => service.contaazul_id.length > 0)

    if (upsertCandidates.length === 0) {
      logger.warn('No services with valid Conta Azul identifier', {
        tenantId,
      })
      return {
        success: true,
        count: 0,
        lastSyncedAt: now,
      }
    }

    const uniqueMap = new Map<string, (typeof upsertCandidates)[0]>()
    upsertCandidates.forEach((service) => {
      uniqueMap.set(service.contaazul_id, service)
    })
    const uniqueServicesData = Array.from(uniqueMap.values())

    const duplicatesCount = upsertCandidates.length - uniqueServicesData.length
    if (duplicatesCount > 0) {
      logger.warn('Found and removed duplicate services', {
        tenantId,
        total: upsertCandidates.length,
        unique: uniqueServicesData.length,
        duplicates: duplicatesCount,
      })
    }

    const contaAzulIds = uniqueServicesData.map((service) => service.contaazul_id)

    let created = uniqueServicesData.length
    let updated = 0

    if (contaAzulIds.length > 0) {
      const { data: existingRows, error: existingQueryError } = await supabase
        .from('contaazul_services' as never)
        .select('contaazul_id')
        .eq('tenant_id', ensuredTenantId)
        .in('contaazul_id', contaAzulIds as never)

      if (existingQueryError) {
        logger.warn('Could not fetch existing Conta Azul services before sync', {
          tenantId: ensuredTenantId,
          error: existingQueryError,
        })
      } else if (Array.isArray(existingRows)) {
        const existingSet = new Set(
          existingRows.map((row: { contaazul_id: string }) => row.contaazul_id).filter(Boolean),
        )
        created = uniqueServicesData.filter(
          (service) => !existingSet.has(service.contaazul_id),
        ).length
        updated = uniqueServicesData.length - created
      }
    }

    const { error: upsertError } = await supabase
      .from('contaazul_services' as never)
      .upsert(uniqueServicesData as never, {
        onConflict: 'tenant_id,contaazul_id',
        ignoreDuplicates: false,
      })

    if (upsertError) {
      logger.error('Error upserting services', upsertError, { tenantId })
      return {
        success: false,
        error: 'Erro ao salvar servicos no banco de dados',
      }
    }

    const { error: inactivateError, count: inactivatedCount } = await supabase
      .from('contaazul_services' as never)
      .update({ is_active: false, updated_at: now } as never)
      .eq('tenant_id', ensuredTenantId)
      .eq('is_active', true)
      .not('contaazul_id', 'in', `(${contaAzulIds.join(',')})` as never)

    if (inactivateError) {
      logger.warn('Error marking services as inactive', {
        tenantId,
        error: inactivateError,
      })
    } else if (inactivatedCount && inactivatedCount > 0) {
      logger.info('Services marked as inactive', {
        tenantId,
        count: inactivatedCount,
      })
    }

    await createActivityLog({
      action_type: ActionType.SYNC_CONTAAZUL_SERVICOS,
      entity_type: 'contaazul_service',
      entity_id: ensuredTenantId,
      new_value: {
        total: upsertCandidates.length,
        unique: uniqueServicesData.length,
        created,
        updated,
        inactivated: inactivatedCount || 0,
        duplicates: duplicatesCount,
        synced_at: now,
      },
    })

    await updateIntegrationSyncTime(ensuredTenantId, 'CONTA_AZUL')

    logger.info('Services synced successfully', {
      tenantId,
      total: uniqueServicesData.length,
      created,
      updated,
      inactivated: inactivatedCount || 0,
      duplicates: duplicatesCount,
      userId,
    })

    revalidatePath(ROUTES.INTEGRATIONS_SERVICES)

    return {
      success: true,
      count: uniqueServicesData.length,
      created,
      updated,
      errors: duplicatesCount > 0 ? duplicatesCount : undefined,
      lastSyncedAt: now,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    logger.error(
      'Unexpected error syncing services',
      error instanceof Error ? error : new Error(String(error)),
      {
        errorMessage,
        tenantId,
      },
    )

    if (errorMessage.includes('No Conta Azul tokens found')) {
      return {
        success: false,
        error: 'Integracao com Conta Azul nao encontrada. Configure a integracao primeiro.',
      }
    }

    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      return {
        success: false,
        error: 'Token de acesso invalido ou expirado. Reconecte a integracao com Conta Azul.',
      }
    }

    if (errorMessage.includes('Missing Conta Azul configuration')) {
      return {
        success: false,
        error: 'Configuracao do Conta Azul nao encontrada. Verifique as variaveis de ambiente.',
      }
    }

    if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
      return {
        success: false,
        error: 'Tabela de servicos nao existe. Aplique as migracoes do banco de dados.',
      }
    }

    return {
      success: false,
      error: `Erro: ${errorMessage}`,
    }
  }
}
