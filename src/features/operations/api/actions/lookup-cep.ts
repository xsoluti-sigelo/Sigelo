'use server'

import { ViaCepClientService } from '@/features/integrations/viacep'
import { logger } from '@/shared/lib/logger'

export interface AddressData {
  cep: string
  street: string
  neighborhood: string
  city: string
  state: string
}

interface LookupCEPResult {
  success: boolean
  data?: AddressData
  error?: string
}

export async function lookupCEP(cep: string): Promise<LookupCEPResult> {
  try {
    const cleanCep = cep.replace(/\D/g, '')

    if (cleanCep.length !== 8) {
      return {
        success: false,
        error: 'CEP deve ter 8 dígitos',
      }
    }

    const viaCepClient = new ViaCepClientService()
    const result = await viaCepClient.fetchAddress(cleanCep)

    if (result.data) {
      return {
        success: true,
        data: {
          cep: result.data.zipCode,
          street: result.data.street,
          neighborhood: result.data.neighborhood,
          city: result.data.city,
          state: result.data.state,
        },
      }
    }

    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      }
    }

    return {
      success: false,
      error: 'CEP não encontrado',
    }
  } catch (error) {
    logger.error('Error looking up CEP', error)
    return {
      success: false,
      error: 'Erro ao buscar CEP. Tente novamente.',
    }
  }
}
