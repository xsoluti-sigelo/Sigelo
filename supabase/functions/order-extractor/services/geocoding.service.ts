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

      const geocodingResult: GeocodingResult = {
        success: true,
        rawAddress,
        geocodedAddress: result.formatted_address,
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        street: components.street,
        number: components.number,
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
