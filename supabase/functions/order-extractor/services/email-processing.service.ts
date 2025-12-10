/**
 * SERVIÇO PRINCIPAL DE PROCESSAMENTO DE EMAILS
 *
 * Orquestra todo o fluxo de processamento:
 * 1. Extração de dados com regex patterns
 * 2. Cálculo de operações MOLIDE
 * 3. Persistência no banco de dados
 * 4. Detecção de problemas
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createLogger } from '../utils/logger.ts'
import { EmailExtractionService, ExtractedEmailData } from './email-extraction.service.ts'
import {
  MOLIDECalculator,
  EventData,
  MOLIDECalculationResult,
} from './molide-calculator.service.ts'
import { DatabasePersistenceService, PersistenceResult } from './database-persistence.service.ts'
import { EventManagementService } from './event-management.service.ts'

const logger = createLogger({ service: 'EmailProcessingService' })

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

export interface EmailProcessingRequest {
  userId: string
  emailId: string
  subject: string
  sender: string
  receivedAt: string
  rawContent: string
}

export interface EmailProcessingResult {
  success: boolean
  emailId?: string
  eventId?: string
  orderIds?: string[]
  operationIds?: string[]
  issueIds?: string[]
  extractedData?: ExtractedEmailData
  molideResult?: MOLIDECalculationResult
  persistenceResult?: PersistenceResult
  errors?: string[]
  warnings?: string[]
  processingTime?: number
}

// ============================================================================
// CLASSE DE SERVIÇO DE PROCESSAMENTO
// ============================================================================

export class EmailProcessingService {
  private supabase: any
  private extractionService: EmailExtractionService
  private molideCalculator: MOLIDECalculator
  private persistenceService: DatabasePersistenceService

  constructor(
    supabaseClient: any,
    supabaseUrl: string,
    serviceRoleKey: string,
    googleMapsApiKey: string,
    tenantId: string,
  ) {
    this.supabase = supabaseClient
    this.extractionService = new EmailExtractionService()
    this.molideCalculator = new MOLIDECalculator()

    // Criar EventManagementService e passar para DatabasePersistenceService
    const eventManagementService = new EventManagementService(supabaseUrl, serviceRoleKey, tenantId)
    this.persistenceService = new DatabasePersistenceService(
      supabaseClient,
      eventManagementService,
      googleMapsApiKey,
      tenantId,
    )
  }

  /**
   * Processa um email completo: extração, cálculo MOLIDE e persistência
   */
  async processEmail(request: EmailProcessingRequest): Promise<EmailProcessingResult> {
    const startTime = Date.now()

    try {
      logger.info('Iniciando processamento completo do email', {
        userId: request.userId,
        emailId: request.emailId,
        subject: request.subject,
      })

      const result: EmailProcessingResult = {
        success: false,
        errors: [],
        warnings: [],
      }

      // 1. Extrair dados do email usando regex patterns
      logger.info('Fase 1: Extração de dados')
      const extractedData = await this.extractionService.extractEmailData(
        request.rawContent,
        request.subject,
      )

      result.extractedData = extractedData

      // Validação básica dos dados extraídos
      if (!extractedData.summary.extractionSuccess) {
        result.errors?.push('Falha na extração de dados - dados insuficientes')
        result.warnings?.push(
          `Apenas ${extractedData.summary.totalFieldsExtracted} campos extraídos`,
        )
      }

      // 2. Verificar se o email é de cancelamento
      if (extractedData.isCancelled) {
        logger.info('Email de cancelamento detectado - processando cancelamento')

        // Persistir email de cancelamento e atualizar evento/ordens
        const cancellationResult = await this.processCancellationEmail(
          extractedData,
          request.userId,
          request.rawContent,
          request.subject,
          request.sender,
          new Date(request.receivedAt),
        )

        result.emailId = cancellationResult.emailId
        result.eventId = cancellationResult.eventId
        result.warnings?.push('Email de cancelamento processado - evento marcado como cancelado')
        result.success = cancellationResult.success
        result.processingTime = Date.now() - startTime

        if (!cancellationResult.success) {
          result.errors?.push(...(cancellationResult.errors || []))
        }

        return result
      }

      if (
        !extractedData.dates.startDate ||
        !extractedData.dates.endDate ||
        !extractedData.dates.startTime ||
        !extractedData.dates.endTime
      ) {
        logger.info('Dados de data/hora ausentes - pulando cálculo MOLIDE')
        result.errors?.push('Datas ou horários não foram extraídos - MOLIDE não calculado')
        result.success = false
        result.processingTime = Date.now() - startTime
        return result
      }

      // 3. Converter dados extraídos para formato do MOLIDE Calculator
      logger.info('Fase 3: Preparação de dados para MOLIDE')
      const eventData = this.convertToEventData(extractedData)

      // 4. Calcular operações MOLIDE
      logger.info('Fase 4: Cálculo de operações MOLIDE')
      const molideResult = await this.molideCalculator.calculateMOLIDEOperations(eventData)

      result.molideResult = molideResult

      logger.info('Operações MOLIDE calculadas', {
        eventType: molideResult.eventType,
        totalOperations: molideResult.operations.length,
        mobilizationCount: molideResult.metadata.mobilizationCount,
        cleaningCount: molideResult.metadata.cleaningCount,
        demobilizationCount: molideResult.metadata.demobilizationCount,
      })

      // 5. Persistir dados no banco
      logger.info('Fase 5: Persistência no banco de dados')
      const persistenceResult = await this.persistenceService.persistEmailData(
        extractedData,
        molideResult,
        request.userId,
        request.rawContent,
        request.subject,
        request.sender,
        new Date(request.receivedAt),
      )

      result.persistenceResult = persistenceResult

      if (!persistenceResult.success) {
        result.errors?.push(...(persistenceResult.errors || []))
        result.warnings?.push(...(persistenceResult.warnings || []))
      } else {
        // Copia IDs do resultado de persistência
        result.emailId = persistenceResult.emailId
        result.eventId = persistenceResult.eventId
        result.orderIds = persistenceResult.orderIds
        result.operationIds = persistenceResult.operationIds
        result.issueIds = persistenceResult.issueIds
      }

      // 5. Determinar sucesso geral
      result.success = persistenceResult.success && extractedData.summary.extractionSuccess

      // 6. Calcular tempo de processamento
      result.processingTime = Date.now() - startTime

      logger.info('Processamento concluído', {
        success: result.success,
        processingTime: result.processingTime,
        totalOperations: molideResult.operations.length,
        totalIssues: persistenceResult.issueIds?.length || 0,
        errors: result.errors?.length || 0,
        warnings: result.warnings?.length || 0,
      })

      return result
    } catch (error) {
      logger.error('Erro no processamento do email', error)

      return {
        success: false,
        errors: [`Erro interno: ${error}`],
        processingTime: Date.now() - startTime,
      }
    }
  }

  /**
   * Processa múltiplos emails em lote
   */
  async processMultipleEmails(
    requests: EmailProcessingRequest[],
  ): Promise<EmailProcessingResult[]> {
    logger.info('Iniciando processamento em lote', { totalEmails: requests.length })

    const results: EmailProcessingResult[] = []

    for (const request of requests) {
      try {
        const result = await this.processEmail(request)
        results.push(result)

        // Pequena pausa entre processamentos para não sobrecarregar
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        logger.error('Erro no processamento de email individual', error)
        results.push({
          success: false,
          errors: [`Erro no processamento: ${error}`],
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    logger.info('Processamento em lote concluído', {
      totalEmails: requests.length,
      successCount,
      failureCount: requests.length - successCount,
    })

    return results
  }

  /**
   * Processa emails não processados de um usuário
   */
  async processUnprocessedEmails(
    userId: string,
    limit: number = 10,
  ): Promise<EmailProcessingResult[]> {
    try {
      logger.info('Buscando emails não processados', { userId, limit })

      // Busca emails não processados do usuário
      const { data: emails, error } = await this.supabase
        .from('new_emails')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .limit(limit)
        .order('received_at', { ascending: true })

      if (error) {
        logger.error('Erro ao buscar emails não processados', error)
        return []
      }

      if (!emails || emails.length === 0) {
        logger.info('Nenhum email não processado encontrado', { userId })
        return []
      }

      logger.info('Emails não processados encontrados', {
        userId,
        count: emails.length,
      })

      // Converte para formato de request
      const requests: EmailProcessingRequest[] = emails.map((email) => ({
        userId: email.user_id,
        emailId: email.id,
        subject: email.subject,
        sender: email.sender,
        receivedAt: email.received_at,
        rawContent: email.raw_content,
      }))

      // Processa os emails
      return await this.processMultipleEmails(requests)
    } catch (error) {
      logger.error('Erro ao processar emails não processados', error)
      return []
    }
  }

  /**
   * Converte dados extraídos para formato do MOLIDE Calculator
   */
  private convertToEventData(extractedData: ExtractedEmailData): EventData {
    return {
      id: extractedData.event.id,
      year: extractedData.event.year,
      description: extractedData.event.description,
      startDate: extractedData.dates.startDate,
      endDate: extractedData.dates.endDate,
      startTime: extractedData.dates.startTime,
      endTime: extractedData.dates.endTime,
      location: extractedData.location,
      contract: extractedData.contract,
      items: extractedData.items.parsed,
      producers: extractedData.producers.parsed,
      coordinators: extractedData.coordinators?.parsed,
      dailies: extractedData.dailies?.parsed, // Lista de datas específicas de uso
      isCancelled: extractedData.isCancelled,
    }
  }

  /**
   * Processa email de cancelamento: persiste o email e marca evento/ordens como cancelados
   */
  private async processCancellationEmail(
    extractedData: ExtractedEmailData,
    userId: string,
    rawContent: string,
    subject: string,
    sender: string,
    receivedAt: Date,
  ): Promise<{
    success: boolean
    emailId?: string
    eventId?: string
    errors?: string[]
  }> {
    const errors: string[] = []

    try {
      logger.info('Processando email de cancelamento', {
        eventNumber: extractedData.event.id,
        year: extractedData.event.year,
        orderId: extractedData.subject.orderId,
      })

      // 1. Gerar IDs
      const emailId = `email-cancel-${extractedData.event.id}-${extractedData.subject.orderId}`
      const eventId = `event-${extractedData.event.id}-${extractedData.event.year}`
      const orderId = `order-${extractedData.subject.orderId}`

      // 2. Persistir email de cancelamento
      const { data: existingEmail } = await this.supabase
        .from('new_emails')
        .select('id')
        .eq('id', emailId)
        .maybeSingle()

      if (!existingEmail) {
        const { error: emailError } = await this.supabase.from('new_emails').insert({
          id: emailId,
          tenant_id: this.persistenceService['tenantId'],
          subject,
          sender,
          received_at: receivedAt.toISOString(),
          raw_content: rawContent,
          extracted_data: extractedData,
          status: 'processed',
        })

        if (emailError) {
          logger.error('Erro ao persistir email de cancelamento', emailError)
          errors.push(`Falha ao persistir email: ${emailError.message}`)
        } else {
          logger.info('Email de cancelamento persistido', { emailId })
        }
      } else {
        logger.info('Email de cancelamento já existe', { emailId })
      }

      // 3. Buscar evento existente pelo número e ano
      const { data: existingEvent } = await this.supabase
        .from('new_events')
        .select('id, number, year, is_cancelled')
        .eq('number', extractedData.event.id)
        .eq('year', extractedData.event.year)
        .maybeSingle()

      if (existingEvent) {
        if (!existingEvent.is_cancelled) {
          // 4. Marcar evento como cancelado
          const { error: updateEventError } = await this.supabase
            .from('new_events')
            .update({
              is_cancelled: true,
              status: 'CANCELLED',
            })
            .eq('id', existingEvent.id)

          if (updateEventError) {
            logger.error('Erro ao marcar evento como cancelado', updateEventError)
            errors.push(`Falha ao cancelar evento: ${updateEventError.message}`)
          } else {
            logger.info('Evento marcado como cancelado', {
              eventId: existingEvent.id,
              number: extractedData.event.id,
            })
          }

          // 5. Marcar a ordem específica como cancelada pelo número da O.F.
          const orderNumber = extractedData.subject.orderId
          logger.info('Buscando O.F. para cancelar', { orderNumber })

          const { data: updatedOrders, error: updateOrdersError } = await this.supabase
            .from('new_orders')
            .update({
              is_cancelled: true,
              status: 'CANCELLED',
              cancellation_reason: extractedData.cancellationReason || 'Cancelado conforme email',
            })
            .eq('number', orderNumber)
            .select('id, number')

          if (updateOrdersError) {
            logger.error('Erro ao marcar ordem como cancelada', {
              orderNumber,
              error: updateOrdersError,
            })
            errors.push(`Falha ao cancelar ordem ${orderNumber}: ${updateOrdersError.message}`)
          } else if (!updatedOrders || updatedOrders.length === 0) {
            logger.warn('Nenhuma O.F. encontrada para cancelar', { orderNumber })
            errors.push(`O.F. ${orderNumber} não encontrada para cancelamento`)
          } else {
            logger.info('O.F. marcada como cancelada', {
              orderNumber,
              orderId: updatedOrders[0].id,
            })
          }

          // 6. Marcar operações como canceladas
          const { error: updateOpsError } = await this.supabase
            .from('new_operations')
            .update({
              status: 'CANCELLED',
            })
            .eq('event_id', existingEvent.id)

          if (updateOpsError) {
            logger.error('Erro ao marcar operações como canceladas', updateOpsError)
          } else {
            logger.info('Operações do evento marcadas como canceladas', {
              eventId: existingEvent.id,
            })
          }
        } else {
          logger.info('Evento já estava cancelado', { eventId: existingEvent.id })
        }

        return {
          success: errors.length === 0,
          emailId,
          eventId: existingEvent.id,
          errors: errors.length > 0 ? errors : undefined,
        }
      } else {
        // Evento não encontrado - pode ser um cancelamento antes da criação do evento
        logger.warn('Evento não encontrado para cancelamento', {
          eventNumber: extractedData.event.id,
          year: extractedData.event.year,
        })
        errors.push(
          `Evento ${extractedData.event.id}/${extractedData.event.year} não encontrado para cancelamento`,
        )

        return {
          success: true, // Email foi salvo, mas evento não existia
          emailId,
          errors,
        }
      }
    } catch (error) {
      logger.error('Erro ao processar cancelamento', error)
      return {
        success: false,
        errors: [`Erro interno: ${error}`],
      }
    }
  }

  /**
   * Obtém estatísticas de processamento de um usuário
   */
  async getProcessingStats(userId: string): Promise<{
    totalEmails: number
    processedEmails: number
    pendingEmails: number
    errorEmails: number
    totalEvents: number
    totalOperations: number
    totalIssues: number
  }> {
    try {
      // Estatísticas de emails
      const { data: emailStats } = await this.supabase
        .from('new_emails')
        .select('status')
        .eq('user_id', userId)

      const emailCounts =
        emailStats?.reduce(
          (acc, email) => {
            acc[email.status] = (acc[email.status] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ) || {}

      // Estatísticas de eventos
      const { data: eventStats } = await this.supabase
        .from('new_events')
        .select('id')
        .eq('user_id', userId)

      // Estatísticas de operações
      const { data: operationStats } = await this.supabase
        .from('new_operations')
        .select('id')
        .eq('user_id', userId)

      // Estatísticas de problemas
      const { data: issueStats } = await this.supabase
        .from('new_issues')
        .select('id')
        .eq('user_id', userId)

      return {
        totalEmails: emailStats?.length || 0,
        processedEmails: emailCounts.processed || 0,
        pendingEmails: emailCounts.pending || 0,
        errorEmails: emailCounts.error || 0,
        totalEvents: eventStats?.length || 0,
        totalOperations: operationStats?.length || 0,
        totalIssues: issueStats?.length || 0,
      }
    } catch (error) {
      logger.error('Erro ao obter estatísticas de processamento', error)
      return {
        totalEmails: 0,
        processedEmails: 0,
        pendingEmails: 0,
        errorEmails: 0,
        totalEvents: 0,
        totalOperations: 0,
        totalIssues: 0,
      }
    }
  }
}
