/**
 * SERVIÇO DE GEOCODING
 *
 * Processa endereços usando Google Geocoding API
 * Extrai componentes estruturados do endereço
 */

import { createLogger } from '../utils/logger.ts'

const logger = createLogger({ service: 'GeocodingService' })

// ============================================================================
// INTERFACES
// ============================================================================

export interface GeocodingResult {
  success: boolean
  rawAddress: string
  geocodedAddress?: string
  formattedAddress?: string
  street?: string
  number?: string
  numberSource?: 'google' | 'regex_fallback'
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  postalCode?: string
  latitude?: number
  longitude?: number
  placeId?: string
  error?: string
  status?: string
}

interface GoogleGeocodingResponse {
  results: Array<{
    formatted_address: string
    place_id: string
    types: string[]
    geometry: {
      location: {
        lat: number
        lng: number
      }
    }
    address_components: Array<{
      long_name: string
      short_name: string
      types: string[]
    }>
  }>
  status: string
  error_message?: string
}

// ============================================================================
// CLASSE DE SERVIÇO
// ============================================================================

export class GeocodingService {
  private apiKey: string

  constructor(googleApiKey: string) {
    if (!googleApiKey) {
      throw new Error('Google API Key is required for GeocodingService')
    }
    this.apiKey = googleApiKey
  }

  /**
   * Processa um endereço usando Google Geocoding API
   */
  async geocodeAddress(rawAddress: string): Promise<GeocodingResult> {
    logger.info('Iniciando geocoding', { rawAddress })

    if (!rawAddress || rawAddress.trim() === '') {
      logger.warn('Endereço vazio fornecido')
      return {
        success: false,
        rawAddress,
        error: 'Endereço vazio',
        status: 'EMPTY_ADDRESS',
      }
    }

    try {
      // Fazer request para Google Geocoding API
      const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
      url.searchParams.append('address', rawAddress)
      url.searchParams.append('key', this.apiKey)
      url.searchParams.append('region', 'br') // Priorizar resultados do Brasil

      logger.info('Chamando Google Geocoding API', {
        url: url.toString().replace(this.apiKey, 'REDACTED'),
      })

      const response = await fetch(url.toString())
      const data: GoogleGeocodingResponse = await response.json()

      logger.info('Resposta da API recebida', { status: data.status })

      // Verificar status da resposta
      if (data.status !== 'OK') {
        logger.error('Geocoding falhou', {
          status: data.status,
          error: data.error_message,
        })
        return {
          success: false,
          rawAddress,
          error: data.error_message || `Geocoding failed with status: ${data.status}`,
          status: data.status,
        }
      }

      // Processar primeiro resultado (mais relevante)
      if (data.results.length === 0) {
        logger.warn('Nenhum resultado encontrado')
        return {
          success: false,
          rawAddress,
          error: 'Nenhum resultado encontrado',
          status: 'ZERO_RESULTS',
        }
      }

      const result = data.results[0]
      const components = this.parseAddressComponents(result.address_components)

      // Verificar se é establishment (Google não retorna street_number nesses casos)
      const isEstablishment =
        result.types?.includes('establishment') || result.types?.includes('point_of_interest')

      // Fallback: extrair número do raw_address se Google não retornou
      let number = components.number
      let numberSource: 'google' | 'regex_fallback' = 'google'

      if (!number) {
        const extractedNumber = this.extractStreetNumber(rawAddress)
        if (extractedNumber) {
          number = extractedNumber
          numberSource = 'regex_fallback'
          logger.info('Número extraído via regex fallback', {
            extractedNumber,
            isEstablishment,
            rawAddress: rawAddress.substring(0, 100),
          })
        }
      }

      const geocodingResult: GeocodingResult = {
        success: true,
        rawAddress,
        geocodedAddress: result.formatted_address,
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        street: components.street,
        number,
        numberSource: number ? numberSource : undefined,
        complement: components.complement,
        neighborhood: components.neighborhood,
        city: components.city,
        state: components.state,
        postalCode: components.postalCode,
        status: 'OK',
      }

      logger.info('Geocoding concluído com sucesso', {
        city: components.city,
        state: components.state,
        hasCoordinates: !!geocodingResult.latitude,
      })

      return geocodingResult
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error('Erro ao fazer geocoding', { error: errorMessage })

      return {
        success: false,
        rawAddress,
        error: `Erro ao processar geocoding: ${errorMessage}`,
        status: 'ERROR',
      }
    }
  }

  /**
   * Extrai componentes estruturados do endereço
   */
  private parseAddressComponents(
    components: GoogleGeocodingResponse['results'][0]['address_components'],
  ): {
    street?: string
    number?: string
    complement?: string
    neighborhood?: string
    city?: string
    state?: string
    postalCode?: string
  } {
    const result: Record<string, string> = {}

    for (const component of components) {
      // Rua
      if (component.types.includes('route')) {
        result.street = component.long_name
      }

      // Número
      if (component.types.includes('street_number')) {
        result.number = component.long_name
      }

      // Bairro
      if (
        component.types.includes('sublocality') ||
        component.types.includes('sublocality_level_1')
      ) {
        result.neighborhood = component.long_name
      }

      // Cidade
      if (component.types.includes('administrative_area_level_2')) {
        result.city = component.long_name
      }

      // Estado
      if (component.types.includes('administrative_area_level_1')) {
        result.state = component.short_name
      }

      // CEP
      if (component.types.includes('postal_code')) {
        result.postalCode = component.long_name
      }
    }

    return result
  }

  private extractStreetNumber(rawAddress: string): string | null {
    if (!rawAddress) return null

    // Normaliza: remove quebras de linha e espaços múltiplos
    const normalized = rawAddress.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim()

    // 1. S/N (Sem Número) - retorna literal
    if (/,\s*S\/N[º°]?(?:\s|$|\/)/i.test(normalized)) {
      return 'S/N'
    }

    // 2. ALT ou ALTURA (ex: "ALT 37", "ALTURA 232")
    const altMatch = normalized.match(/,\s*ALT(?:URA)?\s+(\d+)/i)
    if (altMatch) return altMatch[1]

    // 3. Range de números (ex: "81-186", "21-63")
    const rangeMatch = normalized.match(/,\s*(\d+[-–]\d+)/)
    if (rangeMatch) return rangeMatch[1]

    // 4. Número após vírgula (padrão mais comum)
    // Captura: "RUA X, 123" ou "RUA X, 123 BAIRRO" ou "RUA X, 123 X RUA Y"
    const numberMatch = normalized.match(/,\s*(\d+[A-Z]?)(?:\s|\/|$|X\s)/i)
    if (numberMatch) return numberMatch[1]

    // 5. Fallback: número após tipo de logradouro
    const fallbackMatch = normalized.match(
      /(?:RUA|R\.|AV|AVENIDA|ALAMEDA|AL\.|TRAVESSA|TV\.|ESTRADA|PRAÇA|PÇ\.)[^,]+,\s*(\d+)/i,
    )
    if (fallbackMatch) return fallbackMatch[1]

    return null
  }

  /**
   * Valida se um endereço parece incompleto ou inválido
   */
  isAddressIncomplete(address: string): boolean {
    if (!address || address.trim() === '') {
      return true
    }

    // Padrões que indicam endereço incompleto
    const incompletePatterns = [
      /s\/n/i, // sem número
      /^[0-9]+$/, // apenas números
      /^\s*-\s*$/, // apenas traço
      /^n\/a$/i, // not available
      /^sem\s+endere/i, // sem endereço
    ]

    return incompletePatterns.some((pattern) => pattern.test(address.trim()))
  }
}
