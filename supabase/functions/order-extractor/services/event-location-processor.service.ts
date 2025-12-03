/**
 * SERVIÇO DE PROCESSAMENTO DE LOCALIZAÇÃO DE EVENTOS
 *
 * Processa endereços de eventos usando geocoding e persiste no banco
 */

import { createLogger } from '../utils/logger.ts'
import { GeocodingService, GeocodingResult } from './geocoding.service.ts'

const logger = createLogger({ service: 'EventLocationProcessorService' })

// ============================================================================
// INTERFACES
// ============================================================================

export interface ProcessLocationResult {
  success: boolean
  locationId?: string
  geocodingResult?: GeocodingResult
  error?: string
  issueCreated?: boolean
}

// ============================================================================
// CLASSE DE SERVIÇO
// ============================================================================

export class EventLocationProcessorService {
  private supabase: any
  private geocodingService: GeocodingService

  constructor(supabaseClient: any, googleApiKey: string) {
    this.supabase = supabaseClient
    this.geocodingService = new GeocodingService(googleApiKey)
  }

  /**
   * Processa o endereço de um evento
   * - Faz geocoding
   * - Salva na tabela event_locations
   * - Cria issue se falhar
   */
  async processEventLocation(
    eventId: string,
    tenantId: string,
    rawAddress: string,
  ): Promise<ProcessLocationResult> {
    logger.info('🟦 [PROCESS_LOCATION] Iniciando processamento de localização', {
      eventId,
      tenantId,
      rawAddress,
    })

    try {
      // 1. Verificar se o endereço parece incompleto
      const isIncomplete = this.geocodingService.isAddressIncomplete(rawAddress)
      logger.info('🟦 [PROCESS_LOCATION] Endereço verificado', { eventId, isIncomplete })

      if (isIncomplete) {
        logger.warn('🟡 [PROCESS_LOCATION] Endereço incompleto detectado', { rawAddress })
        // Salvar mesmo assim, mas sem geocoding
        logger.info('🟦 [PROCESS_LOCATION] Tentando salvar endereço incompleto...', { eventId })
        const locationId = await this.saveLocation(eventId, tenantId, {
          success: false,
          rawAddress,
          error: 'Endereço incompleto ou inválido',
          status: 'INCOMPLETE_ADDRESS',
        })

        logger.info('🟦 [PROCESS_LOCATION] Endereço incompleto salvo', { eventId, locationId })

        return {
          success: false,
          locationId,
          error: 'Endereço incompleto',
          issueCreated: false, // Issue será criado externamente
        }
      }

      // 2. Fazer geocoding
      logger.info('🟦 [PROCESS_LOCATION] Iniciando geocoding...', { eventId })
      const geocodingResult = await this.geocodingService.geocodeAddress(rawAddress)
      logger.info('🟦 [PROCESS_LOCATION] Geocoding concluído', {
        eventId,
        success: geocodingResult.success,
        status: geocodingResult.status,
      })

      // 3. Salvar localização no banco (sempre, mesmo se falhar)
      logger.info('🟦 [PROCESS_LOCATION] Tentando salvar localização...', { eventId })
      const locationId = await this.saveLocation(eventId, tenantId, geocodingResult)
      logger.info('🟦 [PROCESS_LOCATION] Localização salva', { eventId, locationId })

      // 4. Retornar resultado
      return {
        success: geocodingResult.success,
        locationId,
        geocodingResult,
        error: geocodingResult.error,
        issueCreated: false,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error('🔴 [PROCESS_LOCATION] Erro ao processar localização', {
        error: errorMessage,
        eventId,
      })

      // Mesmo com erro crítico, tentar salvar o endereço bruto
      try {
        logger.info('🟦 [PROCESS_LOCATION] Tentando salvar com erro...', { eventId })
        const locationId = await this.saveLocation(eventId, tenantId, {
          success: false,
          rawAddress,
          error: errorMessage,
          status: 'ERROR',
        })

        logger.info('🟦 [PROCESS_LOCATION] Localização com erro salva', { eventId, locationId })

        return {
          success: false,
          locationId,
          error: `Erro ao processar localização: ${errorMessage}`,
          issueCreated: false,
        }
      } catch (saveError) {
        const saveErrorMessage = saveError instanceof Error ? saveError.message : String(saveError)
        logger.error('🔴 [PROCESS_LOCATION] Falha ao salvar localização com erro', {
          eventId,
          saveError: saveErrorMessage,
        })
        return {
          success: false,
          error: `Erro ao processar localização: ${errorMessage}`,
          issueCreated: false,
        }
      }
    }
  }

  /**
   * Salva a localização na tabela event_locations
   */
  private async saveLocation(
    eventId: string,
    tenantId: string,
    geocodingResult: GeocodingResult,
  ): Promise<string> {
    logger.info('🔵 [SAVE_LOCATION] Iniciando salvamento de localização', {
      eventId,
      tenantId,
      hasRawAddress: !!geocodingResult.rawAddress,
      geocodingSuccess: geocodingResult.success,
    })

    const locationRecord = {
      event_id: eventId,
      tenant_id: tenantId,
      raw_address: geocodingResult.rawAddress,
      geocoded_address: geocodingResult.geocodedAddress || null,
      formatted_address: geocodingResult.formattedAddress || null,
      street: geocodingResult.street || null,
      number: geocodingResult.number || null,
      complement: geocodingResult.complement || null,
      neighborhood: geocodingResult.neighborhood || null,
      city: geocodingResult.city || null,
      state: geocodingResult.state || null,
      postal_code: geocodingResult.postalCode || null,
      latitude: geocodingResult.latitude || null,
      longitude: geocodingResult.longitude || null,
      place_id: geocodingResult.placeId || null,
      geocoding_status: geocodingResult.status || null,
      geocoding_error: geocodingResult.error || null,
      geocoded_at: geocodingResult.success ? new Date().toISOString() : null,
      location_role: 'VENUE', // Endereço do evento é sempre VENUE
      is_primary: true,
    }

    logger.info('🔵 [SAVE_LOCATION] Registro preparado para inserção', {
      eventId,
      recordKeys: Object.keys(locationRecord),
      hasCoordinates: !!locationRecord.latitude,
      status: locationRecord.geocoding_status,
    })

    logger.info('🔵 [SAVE_LOCATION] Chamando insert no Supabase', { eventId })

    const { data, error } = await this.supabase
      .from('event_locations')
      .insert(locationRecord)
      .select()
      .single()

    if (error) {
      logger.error('🔴 [SAVE_LOCATION] Erro ao salvar localização', {
        eventId,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      throw new Error(`Falha ao salvar localização: ${error.message}`)
    }

    if (!data) {
      logger.error('🔴 [SAVE_LOCATION] Sem erro mas data é null/undefined', { eventId })
      throw new Error('Falha ao salvar localização: data retornou vazio')
    }

    logger.info('🟢 [SAVE_LOCATION] Localização salva com sucesso', {
      locationId: data.id,
      eventId: data.event_id,
      hasCoordinates: !!data.latitude,
      status: data.geocoding_status,
    })

    return data.id
  }

  /**
   * Cria um issue para problema de geocoding
   */
  async createGeocodingIssue(
    eventId: string,
    rawAddress: string,
    error: string,
  ): Promise<string | null> {
    logger.info('Criando issue de geocoding', { eventId, error })

    try {
      // Usar 'incomplete_address' para permitir edição inline no frontend
      const issueRecord = {
        id: `${eventId}-issue-geocoding`,
        tenant_id: '259978eb-56c6-4434-9134-9621fab028c1',
        event_id: eventId,
        type: 'incomplete_address',
        message: error.includes('incompleto') ? 'Endereço incompleto' : 'Falha ao geocodificar endereço',
        severity: 'MEDIUM',
        field_affected: 'location',
        current_value: rawAddress,
        suggested_value: 'Verificar e corrigir endereço',
        status: 'OPEN',
      }

      const { data, error: insertError } = await this.supabase
        .from('new_issues')
        .insert(issueRecord)
        .select()
        .single()

      if (insertError) {
        logger.error('Erro ao criar issue de geocoding', { error: insertError })
        return null
      }

      logger.info('Issue de geocoding criado', { issueId: data.id })
      return data.id
    } catch (error) {
      logger.error('Erro ao criar issue', { error })
      return null
    }
  }
}
