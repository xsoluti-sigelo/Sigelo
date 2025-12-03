import { logger } from '@/shared/lib/logger'
import type { ViaCepResponse, AddressData, ViaCepError } from '../types/viacep.types'

export class ViaCepClientService {
  private readonly baseUrl = 'https://viacep.com.br/ws'
  private readonly timeout = 5000

  async fetchAddress(
    cep: string,
  ): Promise<{ data: AddressData | null; error: ViaCepError | null }> {
    const cleanCep = this.cleanCep(cep)

    if (!this.isValidCep(cleanCep)) {
      logger.warn('[ViaCEP] Invalid CEP format', { cep })
      return {
        data: null,
        error: {
          type: 'INVALID_CEP',
          message: 'CEP deve conter 8 dígitos',
        },
      }
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(`${this.baseUrl}/${cleanCep}/json/`, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        logger.error('[ViaCEP] API error', { status: response.status, cep: cleanCep })
        return {
          data: null,
          error: {
            type: 'NETWORK_ERROR',
            message: `Erro na API ViaCEP (HTTP ${response.status})`,
          },
        }
      }

      const data: ViaCepResponse = await response.json()

      if (data.erro) {
        logger.info('[ViaCEP] CEP not found', { cep: cleanCep })
        return {
          data: null,
          error: {
            type: 'NOT_FOUND',
            message: 'CEP não encontrado',
          },
        }
      }

      const formattedAddress = this.formatAddress(data)
      logger.info('[ViaCEP] Address fetched successfully', { cep: cleanCep })

      return {
        data: formattedAddress,
        error: null,
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        logger.error('[ViaCEP] Request timeout', { cep: cleanCep })
        return {
          data: null,
          error: {
            type: 'TIMEOUT',
            message: 'Tempo limite excedido ao buscar CEP',
            originalError: error as Error,
          },
        }
      }

      logger.error('[ViaCEP] Unexpected error', error as Error, { cep: cleanCep })
      return {
        data: null,
        error: {
          type: 'UNKNOWN',
          message: 'Erro ao buscar CEP',
          originalError: error as Error,
        },
      }
    }
  }

  private cleanCep(cep: string): string {
    return cep.replace(/\D/g, '')
  }

  private isValidCep(cep: string): boolean {
    return /^\d{8}$/.test(cep)
  }

  private formatAddress(data: ViaCepResponse): AddressData {
    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      zipCode: data.cep || '',
      complement: data.complemento || undefined,
    }
  }
}
