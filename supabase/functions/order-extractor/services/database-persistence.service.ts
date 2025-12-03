/**
 * SERVIÇO DE PERSISTÊNCIA NO BANCO DE DADOS
 *
 * Implementa a persistência de dados extraídos e operações MOLIDE
 * usando o schema ideal definido em ideal-database-schema.sql
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createLogger } from '../utils/logger.ts'
import { ExtractedEmailData } from './email-extraction.service.ts'
import { MOLIDECalculationResult } from './molide-calculator.service.ts'
import { EventManagementService } from './event-management.service.ts'
import { EventLocationProcessorService } from './event-location-processor.service.ts'

const logger = createLogger({ service: 'DatabasePersistenceService' })

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

export interface PersistenceResult {
  success: boolean
  emailId?: string
  eventId?: string
  orderIds?: string[]
  operationIds?: string[]
  issueIds?: string[]
  errors?: string[]
  warnings?: string[]
}

export interface DatabaseRecord {
  email: any
  event: any
  orders: any[]
  orderItems: any[]
  people: any[]
  operations: any[]
  issues: any[]
}

// ============================================================================
// CLASSE DE SERVIÇO DE PERSISTÊNCIA
// ============================================================================

export class DatabasePersistenceService {
  private supabase: any
  private eventManagement: EventManagementService
  private locationProcessor: EventLocationProcessorService
  private tenantId: string

  constructor(
    supabaseClient: any,
    eventManagementService: EventManagementService,
    googleApiKey: string,
    tenantId: string,
  ) {
    this.supabase = supabaseClient
    this.eventManagement = eventManagementService
    this.locationProcessor = new EventLocationProcessorService(supabaseClient, googleApiKey)
    this.tenantId = tenantId
  }

  /**
   * Persiste dados completos de um email processado
   */
  async persistEmailData(
    emailData: ExtractedEmailData,
    molideResult: MOLIDECalculationResult,
    userId: string,
    rawEmailContent: string,
    emailSubject: string,
    senderEmail: string,
    receivedAt: Date,
  ): Promise<PersistenceResult> {
    try {
      logger.info('Iniciando persistência de dados do email', {
        userId,
        eventId: emailData.event.id,
        subject: emailSubject,
      })

      const result: PersistenceResult = {
        success: false,
        errors: [],
        warnings: [],
      }

      // 1. Gerar IDs únicos
      const emailId = this.generateEmailId(emailData.event.id, emailData.subject.orderId)
      const eventId = this.generateEventId(emailData.event.id, emailData.event.year)
      const orderId = this.generateOrderId(emailData.subject.orderId)

      // 2. Persistir email
      const emailResult = await this.persistEmail(
        emailId,
        userId,
        emailSubject,
        senderEmail,
        receivedAt,
        rawEmailContent,
        emailData,
      )

      if (emailResult.error || !emailResult.data) {
        result.errors?.push(`Falha ao persistir email: ${emailResult.error || 'Unknown error'}`)
        return result
      }

      result.emailId = emailId

      // Se email já existe, verificar se precisa processar MOLIDE e linkagens
      const emailAlreadyExists = emailResult.alreadyExists
      if (emailAlreadyExists) {
        result.warnings?.push('Email já foi processado anteriormente')
        logger.info('Email já processado, verificando MOLIDE e linkagens', { emailId })

        // Verificar se operações MOLIDE já existem
        const { data: existingOperations } = await this.supabase
          .from('new_operations')
          .select('id')
          .eq('event_id', eventId)
          .limit(1)

        if (existingOperations && existingOperations.length > 0) {
          logger.info('MOLIDE já calculado para este evento, pulando completamente', {
            emailId,
            eventId,
          })
          result.success = true
          return result
        }

        logger.info('MOLIDE não encontrado, processando MOLIDE e linkagens', { emailId, eventId })
        // Continuar para processar MOLIDE e linkagens (pular criação de evento/ordem)
      }

      // 3, 4, 5. Processar evento, ordem e itens usando EventManagementService
      // (aplica as 4 regras de negócio automaticamente)
      // PULAR se email já existe (evento/ordem já foram criados)
      if (!emailAlreadyExists) {
        try {
          // Calcular valores para campos adicionais
          const startDate = this.convertDateFormat(emailData.dates.startDate)
          const endDate = emailData.dates.endDate
            ? this.convertDateFormat(emailData.dates.endDate)
            : startDate
          const startTime = this.convertTimeFormat(emailData.dates.startTime)
          const endTime = this.convertTimeFormat(emailData.dates.endTime)
          const isNightEvent = this.detectNightEvent(startTime, endTime)
          const isIntermittent = this.detectIntermittentEvent(emailData)

          // Determinar tipo do evento
          const eventType = this.determineEventType(startDate, endDate, isIntermittent)

          // Gerar regra de limpeza
          const cleaningRule = this.generateCleaningRule(isNightEvent)

          // Verificar se há horários inválidos
          const hasInvalidTime = this.hasInvalidTime(startTime, endTime)

          const managementResult = await this.eventManagement.processEventEmail(
            // Dados do evento
            {
              id: eventId,
              emailId: emailId,
              number: emailData.event.id,
              year: emailData.event.year,
              name: emailData.event.description,
              date: startDate,
              start_date: startDate,
              end_date: endDate,
              startTime: startTime,
              endTime: endTime,
              location: emailData.location,
              contract: emailData.contract,
              isNightEvent: isNightEvent,
              isIntermittent: isIntermittent,
              eventType: eventType,
              cleaningRule: cleaningRule,
              hasInvalidTime: hasInvalidTime,
              receivedDate: receivedAt.toISOString(),
              dailies: emailData.dailies?.parsed, // Datas específicas para eventos intermitentes
            },
            // Dados da ordem
            {
              id: orderId,
              eventId: eventId,
              number: emailData.subject.orderId,
              date: this.convertDateFormat(emailData.dates.startDate),
              totalValue: emailData.items.totalValue,
              isCancelled: emailData.isCancelled,
              cancellationReason: emailData.cancellationReason,
            },
            // Itens da ordem
            emailData.items.parsed.map((item, index) => ({
              id: `${orderId}-item-${String(index + 1).padStart(3, '0')}`,
              orderId: orderId,
              description: item.description,
              quantity: item.quantity,
              days: item.days,
              unitPrice: item.totalValue / item.quantity, // Preço unitário = total ÷ quantidade
              item_total: item.totalValue,
            })),
            // Pessoas
            this.preparePeopleData(eventId, emailData),
          )

          logger.info('EventManagementService processou com sucesso', {
            action: managementResult.action,
            message: managementResult.message,
          })
        } catch (error) {
          logger.error('Erro ao processar evento/ordem com EventManagementService', { error })
          result.errors?.push(`Falha ao persistir evento/ordem: ${error.message}`)
          return result
        }
      }

      // 5.1, 5.2, 5.3. Vincular ao ContaAzul (executar sempre, mesmo para emails duplicados)
      result.eventId = eventId
      result.orderIds = [orderId]

      // 5.1. Vincular evento ao cliente SPTURIS na tabela new_events_contaazul_pessoas
      await this.linkEventToClient(eventId)

      // 5.2. Vincular serviços do evento aos serviços do ContaAzul
      await this.linkEventServices(eventId, emailData)

      // 5.3. Vincular itens das ordens aos serviços do ContaAzul
      await this.linkOrderItemsToServices(orderId, emailData)

      // 6. Persistir operações MOLIDE
      const operations = await this.persistOperations(eventId, userId, molideResult)

      if (operations.length === 0) {
        result.warnings?.push('Nenhuma operação MOLIDE foi persistida')
      }

      result.operationIds = operations.map((op) => op.id)

      // 7. Atualizar campos MOLIDE datetime no evento
      await this.updateEventMOLIDEDatetimes(eventId, molideResult)

      // 8. Detectar e persistir problemas
      const issues = await this.detectAndPersistIssues(eventId, userId, emailData)

      result.issueIds = issues.map((issue) => issue.id)

      // 9. Processar localização com geocoding
      logger.info('🟠 [DB_PERSIST] Início do processamento de localização', {
        eventId,
        hasLocation: !!emailData.location,
        locationLength: emailData.location?.length || 0,
        tenantId: this.tenantId,
      })

      if (emailData.location && emailData.location.trim() !== '') {
        logger.info('🟠 [DB_PERSIST] Chamando locationProcessor.processEventLocation', {
          eventId,
          tenantId: this.tenantId,
          rawLocation: emailData.location,
        })

        const locationResult = await this.locationProcessor.processEventLocation(
          eventId,
          this.tenantId,
          emailData.location,
        )

        logger.info('🟠 [DB_PERSIST] locationProcessor retornou', {
          eventId,
          success: locationResult.success,
          hasLocationId: !!locationResult.locationId,
          locationId: locationResult.locationId,
          error: locationResult.error,
        })

        if (locationResult.success) {
          logger.info('🟢 [DB_PERSIST] Localização geocodificada com sucesso', {
            eventId,
            locationId: locationResult.locationId,
            hasCoordinates: !!locationResult.geocodingResult?.latitude,
          })
        } else {
          logger.warn('🟡 [DB_PERSIST] Geocoding falhou ou endereço incompleto', {
            eventId,
            error: locationResult.error,
            hasLocationId: !!locationResult.locationId,
          })

          // Criar issue sempre que houver erro de localização (incluindo endereços incompletos)
          if (locationResult.error) {
            logger.info('🟠 [DB_PERSIST] Criando issue de geocoding', { eventId })
            const issueId = await this.locationProcessor.createGeocodingIssue(
              eventId,
              emailData.location,
              locationResult.error,
            )
            if (issueId) {
              result.issueIds?.push(issueId)
              result.warnings?.push('Geocoding falhou - issue criado')
              logger.info('🟠 [DB_PERSIST] Issue de geocoding criado', { eventId, issueId })
            }
          }
        }
      } else {
        logger.warn('🟡 [DB_PERSIST] Localização vazia, pulando geocoding', { eventId })
        result.warnings?.push('Localização não encontrada no email')
      }

      // 10. Marcar sucesso
      result.success = true

      logger.info('Persistência concluída com sucesso', {
        emailId,
        eventId,
        orderId,
        totalOperations: operations.length,
        totalIssues: issues.length,
      })

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : undefined
      logger.error('Erro na persistência de dados', {
        message: errorMessage,
        stack: errorStack,
        error: JSON.stringify(error, null, 2),
      })
      return {
        success: false,
        errors: [`Erro interno: ${errorMessage}`],
      }
    }
  }

  /**
   * Persiste dados do email na tabela new_emails
   */
  private async persistEmail(
    emailId: string,
    userId: string,
    subject: string,
    sender: string,
    receivedAt: Date,
    rawContent: string,
    extractedData: ExtractedEmailData,
  ): Promise<{ data: any; error?: string; alreadyExists?: boolean }> {
    // First, check if email already exists
    const { data: existingEmail } = await this.supabase
      .from('new_emails')
      .select('*')
      .eq('id', emailId)
      .single()

    if (existingEmail) {
      logger.info('Email já existe no banco, pulando inserção', { emailId })
      return { data: existingEmail, alreadyExists: true }
    }

    const emailRecord = {
      id: emailId,
      tenant_id: this.tenantId,
      subject,
      sender,
      received_at: receivedAt.toISOString(),
      raw_content: rawContent,
      extracted_data: extractedData,
      status: 'processed',
    }

    const { data, error } = await this.supabase
      .from('new_emails')
      .insert(emailRecord)
      .select()
      .single()

    if (error) {
      const errorMsg = `${error.message}${error.details ? ` - ${error.details}` : ''}${error.hint ? ` (${error.hint})` : ''}`
      logger.error('Erro ao persistir email', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        emailRecord: JSON.stringify(emailRecord, null, 2),
      })
      return { data: null, error: errorMsg }
    }

    logger.info('Email persistido com sucesso', { emailId })
    return { data }
  }

  /**
   * Persiste dados do evento na tabela new_events
   */
  private async persistEvent(
    eventId: string,
    emailId: string,
    userId: string,
    emailData: ExtractedEmailData,
  ): Promise<any> {
    const eventRecord = {
      id: eventId,
      tenant_id: this.tenantId,
      email_id: emailId,
      number: emailData.event.id,
      year: emailData.event.year,
      name: emailData.event.description,
      date: this.convertDateFormat(emailData.dates.startDate),
      start_time: this.convertTimeFormat(emailData.dates.startTime),
      end_time: this.convertTimeFormat(emailData.dates.endTime),
      location: emailData.location,
      contract: emailData.contract,
      client_name: emailData.producers.parsed[0]?.name || '',
      client_cnpj: '', // Não extraído do email
      total_value: emailData.items.totalValue,
      is_cancelled: emailData.isCancelled,
      is_night_event: this.detectNightEvent(emailData.dates.startTime, emailData.dates.endTime),
      is_intermittent: this.detectIntermittentEvent(emailData),
    }

    const { data, error } = await this.supabase
      .from('new_events')
      .insert(eventRecord)
      .select()
      .single()

    if (error) {
      logger.error('Erro ao persistir evento', error)
      return null
    }

    logger.info('Evento persistido com sucesso', { eventId })
    return data
  }

  /**
   * Persiste ordem de fornecimento na tabela new_orders
   */
  private async persistOrder(
    orderId: string,
    eventId: string,
    userId: string,
    emailData: ExtractedEmailData,
  ): Promise<any> {
    const orderRecord = {
      id: orderId,
      event_id: eventId,
      number: emailData.subject.orderId,
      date: this.convertDateFormat(emailData.dates.startDate),
      total_value: emailData.items.totalValue,
      status: emailData.isCancelled ? 'cancelled' : 'active',
      is_cancelled: emailData.isCancelled,
      cancellation_reason: emailData.isCancelled ? 'Cancelado conforme email' : null,
    }

    const { data, error } = await this.supabase
      .from('new_orders')
      .insert(orderRecord)
      .select()
      .single()

    if (error) {
      logger.error('Erro ao persistir ordem', error)
      return null
    }

    logger.info('Ordem persistida com sucesso', { orderId })
    return data
  }

  /**
   * Persiste itens da ordem na tabela new_order_items
   */
  private async persistOrderItems(
    orderId: string,
    userId: string,
    emailData: ExtractedEmailData,
  ): Promise<any[]> {
    const orderItems = emailData.items.parsed.map((item, index) => ({
      id: `${orderId}-item-${String(index + 1).padStart(3, '0')}`,
      order_id: orderId,
      description: item.description,
      quantity: item.quantity,
      days: item.days,
      unit_price: item.totalValue / (item.quantity * item.days),
      item_total: item.totalValue,
    }))

    const { data, error } = await this.supabase.from('new_order_items').insert(orderItems).select()

    if (error) {
      logger.error('Erro ao persistir itens da ordem', error)
      return []
    }

    logger.info('Itens da ordem persistidos com sucesso', {
      orderId,
      totalItems: orderItems.length,
    })
    return data
  }

  /**
   * Persiste pessoas envolvidas na tabela new_people
   */
  private async persistPeople(
    eventId: string,
    userId: string,
    emailData: ExtractedEmailData,
  ): Promise<any[]> {
    const people: any[] = []

    // Adiciona produtores
    emailData.producers.parsed.forEach((producer, index) => {
      people.push({
        id: `${eventId}-producer-${String(index + 1).padStart(3, '0')}`,
        tenant_id: this.tenantId,
        event_id: eventId,
        name: producer.name,
        role: 'producer',
        phone: producer.phones[0] || null,
        is_primary: index === 0,
      })
    })

    // Adiciona coordenadores se existirem
    if (emailData.coordinators) {
      emailData.coordinators.parsed.forEach((coordinator, index) => {
        people.push({
          id: `${eventId}-coordinator-${String(index + 1).padStart(3, '0')}`,
          tenant_id: this.tenantId,
          event_id: eventId,
          name: coordinator.name,
          role: 'coordinator',
          phone: coordinator.phones[0] || null,
          is_primary: false,
        })
      })
    }

    if (people.length === 0) {
      logger.warn('Nenhuma pessoa encontrada para persistir', { eventId })
      return []
    }

    const { data, error } = await this.supabase.from('new_people').insert(people).select()

    if (error) {
      logger.error('Erro ao persistir pessoas', error)
      return []
    }

    logger.info('Pessoas persistidas com sucesso', {
      eventId,
      totalPeople: people.length,
    })
    return data
  }

  /**
   * Persiste operações MOLIDE na tabela new_operations
   * IMPORTANTE: Operações são por EVENTO, não por O.F.
   * Verifica se já existem operações antes de criar para evitar duplicação
   */
  private async persistOperations(
    eventId: string,
    userId: string,
    molideResult: MOLIDECalculationResult,
  ): Promise<any[]> {
    // Verificar se já existem operações para este evento
    const { data: existingOperations } = await this.supabase
      .from('new_operations')
      .select('*')
      .eq('event_id', eventId)

    if (existingOperations && existingOperations.length > 0) {
      logger.info('Operações MOLIDE já existem para este evento, reutilizando', {
        eventId,
        totalOperations: existingOperations.length,
      })
      return existingOperations
    }

    // Se não existem, criar novas operações
    const operations = molideResult.operations.map((op) => ({
      // UUID será gerado automaticamente pelo banco de dados
      tenant_id: this.tenantId,
      event_id: eventId,
      type: op.type,
      subtype: op.subtype ? op.subtype.toLowerCase().replace('-', '_') : null,
      date: this.convertDateFormat(op.date),
      time: this.convertTimeFormat(op.time),
      duration: op.duration,
      vehicle_type: op.vehicleType,
      driver: op.driver,
      vehicle: op.vehicle,
      helper: op.helper,
      status: op.status,
      notes: op.notes,
    }))

    const { data, error } = await this.supabase.from('new_operations').insert(operations).select()

    if (error) {
      logger.error('Erro ao persistir operações MOLIDE', error)
      return []
    }

    logger.info('Operações MOLIDE persistidas com sucesso', {
      eventId,
      totalOperations: operations.length,
      eventType: molideResult.eventType,
    })
    return data
  }

  /**
   * Atualiza os campos MOLIDE datetime no evento
   */
  private async updateEventMOLIDEDatetimes(
    eventId: string,
    molideResult: MOLIDECalculationResult,
  ): Promise<void> {
    const updatePayload: any = {}

    if (molideResult.mobilizationDateTime) {
      updatePayload.mobilization_datetime = molideResult.mobilizationDateTime.toISOString()
    }

    if (molideResult.demobilizationDateTime) {
      updatePayload.demobilization_datetime = molideResult.demobilizationDateTime.toISOString()
    }

    if (molideResult.preCleaningDateTime) {
      updatePayload.pre_cleaning_datetime = molideResult.preCleaningDateTime.toISOString()
    }

    if (molideResult.postCleaningDateTime) {
      updatePayload.post_cleaning_datetime = molideResult.postCleaningDateTime.toISOString()
    }

    if (Object.keys(updatePayload).length === 0) {
      logger.warn('Nenhum campo MOLIDE datetime para atualizar', { eventId })
      return
    }

    const { error } = await this.supabase.from('new_events').update(updatePayload).eq('id', eventId)

    if (error) {
      logger.error('Erro ao atualizar campos MOLIDE datetime', { eventId, error })
    } else {
      logger.info('Campos MOLIDE datetime atualizados com sucesso', {
        eventId,
        fields: Object.keys(updatePayload),
      })
    }
  }

  /**
   * Detecta e persiste problemas na tabela new_issues
   */
  private async detectAndPersistIssues(
    eventId: string,
    userId: string,
    emailData: ExtractedEmailData,
  ): Promise<any[]> {
    const issues: any[] = []

    // Detecta problemas comuns
    if (!emailData.event.id) {
      issues.push({
        id: `${eventId}-issue-001`,
        tenant_id: this.tenantId,
        event_id: eventId,
        type: 'missing_event_id',
        message: 'ID do evento não encontrado no email',
        severity: 'HIGH',
        field_affected: 'event.id',
        current_value: '',
        suggested_value: 'Verificar formato do email',
      })
    }

    if (!emailData.dates.startDate) {
      issues.push({
        id: `${eventId}-issue-002`,
        tenant_id: this.tenantId,
        event_id: eventId,
        type: 'missing_start_date',
        message: 'Data de início não encontrada no email',
        severity: 'HIGH',
        field_affected: 'dates.startDate',
        current_value: '',
        suggested_value: 'Verificar formato de data no email',
      })
    }

    if (emailData.location.includes('s/n')) {
      issues.push({
        id: `${eventId}-issue-003`,
        tenant_id: this.tenantId,
        event_id: eventId,
        type: 'incomplete_address',
        message: 'Endereço incompleto (s/n)',
        severity: 'MEDIUM',
        field_affected: 'location',
        current_value: emailData.location,
        suggested_value: 'Completar endereço com número',
      })
    }

    // Verifica horários inválidos (00:00, 00:00h, ou vazios)
    const startTimeNormalized = emailData.dates.startTime?.replace('h', '')
    const endTimeNormalized = emailData.dates.endTime?.replace('h', '')

    if (
      startTimeNormalized === '00:00' ||
      endTimeNormalized === '00:00' ||
      !emailData.dates.startTime ||
      !emailData.dates.endTime
    ) {
      issues.push({
        id: `${eventId}-issue-004`,
        tenant_id: this.tenantId,
        event_id: eventId,
        type: 'invalid_time',
        message: 'Horário inválido (00:00) ou não informado',
        severity: 'MEDIUM',
        field_affected: 'horário',
        current_value: `${emailData.dates.startTime || 'vazio'} - ${emailData.dates.endTime || 'vazio'}`,
        suggested_value: 'Verificar horários corretos',
      })
    }

    if (emailData.items.parsed.length === 0) {
      issues.push({
        id: `${eventId}-issue-005`,
        tenant_id: this.tenantId,
        event_id: eventId,
        type: 'no_items',
        message: 'Nenhum item encontrado no email',
        severity: 'HIGH',
        field_affected: 'items',
        current_value: '0',
        suggested_value: 'Verificar seção de itens no email',
      })
    }

    if (issues.length === 0) {
      logger.info('Nenhum problema detectado', { eventId })
      return []
    }

    const { data, error } = await this.supabase.from('new_issues').insert(issues).select()

    if (error) {
      logger.error('Erro ao persistir problemas', error)
      return []
    }

    logger.info('Problemas persistidos com sucesso', {
      eventId,
      totalIssues: issues.length,
    })
    return data
  }

  // ============================================================================
  // FUNÇÕES AUXILIARES
  // ============================================================================

  private generateEmailId(eventId: string, orderId: string): string {
    return `email-${eventId}-${orderId}`
  }

  private generateEventId(eventId: string, year: number): string {
    return `event-${eventId}-${year}`
  }

  private generateOrderId(orderId: string): string {
    return `order-${orderId}`
  }

  private detectNightEvent(startTime: string, endTime: string): boolean {
    const start = this.parseTime(startTime)
    const end = this.parseTime(endTime)
    return end < start
  }

  private detectIntermittentEvent(emailData: ExtractedEmailData): boolean {
    // Se existe seção DIÁRIA(s) com datas específicas, o evento é intermitente
    return !!(emailData.dailies && emailData.dailies.exists && emailData.dailies.parsed.length > 0)
  }

  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours + minutes / 60
  }

  /**
   * Converte data de DD/MM/YYYY para YYYY-MM-DD (formato PostgreSQL)
   */
  private convertDateFormat(dateStr: string): string {
    if (!dateStr) return dateStr

    // Se já está no formato YYYY-MM-DD, retorna como está
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateStr
    }

    // Converte de DD/MM/YYYY para YYYY-MM-DD
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = dateStr.split('/')
      return `${year}-${month}-${day}`
    }

    // Retorna como está se não reconhecer o formato
    return dateStr
  }

  /**
   * Converte hora de "HH:MMh" para "HH:MM:00" (formato PostgreSQL TIME)
   */
  private convertTimeFormat(timeStr: string): string {
    if (!timeStr) return timeStr

    // Remove o "h" do final e adiciona ":00" para segundos
    // "10:55h" -> "10:55:00"
    // "00:00h" -> "00:00:00"
    if (timeStr.match(/^\d{1,2}:\d{2}h?$/)) {
      return timeStr.replace(/h$/, '') + ':00'
    }

    // Se já está no formato HH:MM:SS, retorna como está
    if (timeStr.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
      return timeStr
    }

    // Retorna como está se não reconhecer o formato
    return timeStr
  }

  /**
   * Determina o tipo do evento baseado nas datas e flag de intermitente
   */
  private determineEventType(
    startDate: string,
    endDate: string,
    isIntermittent: boolean,
  ): 'SINGLE_OCCURRENCE' | 'INTERMITENTE' | 'CONTINUO' {
    if (isIntermittent) {
      return 'INTERMITENTE'
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 3) {
      return 'SINGLE_OCCURRENCE'
    }

    if (diffDays > 7) {
      return 'CONTINUO'
    }

    return 'SINGLE_OCCURRENCE'
  }

  /**
   * Gera regra de limpeza baseado no tipo de evento
   */
  private generateCleaningRule(isNightEvent: boolean): any {
    if (isNightEvent) {
      return {
        type: 'custom',
        preUse: false,
        postUse: true,
        time: '03:00',
        daysOfWeek: null,
      }
    }

    return {
      type: 'daily',
      preUse: true,
      postUse: false,
      time: '06:00',
      daysOfWeek: null,
    }
  }

  /**
   * Verifica se os horários são inválidos (00:00:00)
   */
  private hasInvalidTime(startTime: string, endTime: string): boolean {
    return startTime === '00:00:00' || endTime === '00:00:00'
  }

  /**
   * Prepara dados das pessoas no formato esperado pelo EventManagementService
   */
  private preparePeopleData(eventId: string, emailData: ExtractedEmailData): any[] {
    const people: any[] = []

    // Adicionar produtores (se existirem)
    if (emailData.producers?.parsed && Array.isArray(emailData.producers.parsed)) {
      emailData.producers.parsed.forEach((producer, index) => {
        people.push({
          id: `${eventId}-producer-${String(index + 1).padStart(3, '0')}`,
          eventId: eventId,
          name: producer.name,
          role: 'producer',
          phone: producer.phones?.[0] || null,
          document: null,
          organization: producer.organization || null,
          isPrimary: index === 0,
        })
      })
    }

    // Adicionar coordenadores (se existirem)
    if (emailData.coordinators?.parsed && Array.isArray(emailData.coordinators.parsed)) {
      emailData.coordinators.parsed.forEach((coordinator, index) => {
        people.push({
          id: `${eventId}-coordinator-${String(index + 1).padStart(3, '0')}`,
          eventId: eventId,
          name: coordinator.name,
          role: 'coordinator',
          phone: coordinator.phones?.[0] || null,
          document: null,
          organization: null,
          isPrimary: index === 0,
        })
      })
    }

    return people
  }

  /**
   * Vincula evento ao cliente SPTURIS na tabela new_events_contaazul_pessoas
   */
  private async linkEventToClient(eventId: string): Promise<void> {
    // ID do SPTURIS na tabela contaazul_pessoas
    const SPTURIS_ID = '5f15fc0b-2cba-4f7a-99d0-75cb4e90fa10'

    try {
      const { error } = await this.supabase.from('new_events_contaazul_pessoas').insert({
        event_id: eventId,
        pessoa_id: SPTURIS_ID,
        tenant_id: this.tenantId,
      })

      if (error) {
        logger.error('Erro ao vincular evento ao cliente SPTURIS', {
          eventId,
          error,
        })
      } else {
        logger.info('Evento vinculado ao cliente SPTURIS', { eventId })
      }
    } catch (error) {
      logger.error('Erro ao vincular evento ao cliente', { eventId, error })
    }
  }

  /**
   * Vincula serviços do evento aos serviços do ContaAzul
   */
  private async linkEventServices(eventId: string, emailData: ExtractedEmailData): Promise<void> {
    // IDs dos serviços na tabela contaazul_services
    const SERVICE_MAPPINGS = {
      'BANHEIRO QUIMICO STANDARD': '6be1765b-72d3-438c-82a9-b2cdbe4380d1',
      'BANHEIRO QUIMICO STD': '6be1765b-72d3-438c-82a9-b2cdbe4380d1',
      'BANHEIRO QUIMICO PADRAO': '6be1765b-72d3-438c-82a9-b2cdbe4380d1',
      'BANHEIRO QUIMICO PCD': '60d43c76-815f-433c-b475-05b87c066378',
      'BANHEIRO QUIMICO PNE': '60d43c76-815f-433c-b475-05b87c066378',
    }

    try {
      const serviceLinks: any[] = []

      for (const item of emailData.items.parsed) {
        const descriptionUpper = item.description.toUpperCase()

        // Buscar correspondência nos mapeamentos
        let serviceId: string | null = null
        for (const [key, id] of Object.entries(SERVICE_MAPPINGS)) {
          if (descriptionUpper.includes(key)) {
            serviceId = id
            break
          }
        }

        // Se encontrou o serviço, adicionar à lista de vínculos
        if (serviceId) {
          serviceLinks.push({
            event_id: eventId,
            service_id: serviceId,
          })
        } else {
          logger.warn('Serviço não mapeado no ContaAzul', {
            eventId,
            description: item.description,
          })
        }
      }

      // Inserir vínculos no banco
      if (serviceLinks.length > 0) {
        const { error } = await this.supabase
          .from('new_events_contaazul_services')
          .insert(serviceLinks)

        if (error) {
          logger.error('Erro ao vincular serviços do evento', {
            eventId,
            error,
          })
        } else {
          logger.info('Serviços vinculados com sucesso', {
            eventId,
            totalServices: serviceLinks.length,
          })
        }
      }
    } catch (error) {
      logger.error('Erro ao processar vínculos de serviços', { eventId, error })
    }
  }

  /**
   * Vincula itens das ordens aos serviços do ContaAzul
   */
  private async linkOrderItemsToServices(
    orderId: string,
    emailData: ExtractedEmailData,
  ): Promise<void> {
    // IDs dos serviços na tabela contaazul_services
    const SERVICE_MAPPINGS = {
      'BANHEIRO QUIMICO STANDARD': '6be1765b-72d3-438c-82a9-b2cdbe4380d1',
      'BANHEIRO QUIMICO STD': '6be1765b-72d3-438c-82a9-b2cdbe4380d1',
      'BANHEIRO QUIMICO PADRAO': '6be1765b-72d3-438c-82a9-b2cdbe4380d1',
      'BANHEIRO QUIMICO PCD': '60d43c76-815f-433c-b475-05b87c066378',
      'BANHEIRO QUIMICO PNE': '60d43c76-815f-433c-b475-05b87c066378',
    }

    try {
      const itemServiceLinks: any[] = []

      emailData.items.parsed.forEach((item, index) => {
        const itemId = `${orderId}-item-${String(index + 1).padStart(3, '0')}`
        const descriptionUpper = item.description.toUpperCase()

        // Buscar correspondência nos mapeamentos
        let serviceId: string | null = null
        for (const [key, id] of Object.entries(SERVICE_MAPPINGS)) {
          if (descriptionUpper.includes(key)) {
            serviceId = id
            break
          }
        }

        // Se encontrou o serviço, adicionar à lista de vínculos
        if (serviceId) {
          itemServiceLinks.push({
            order_item_id: itemId,
            service_id: serviceId,
          })
        } else {
          logger.warn('Item não mapeado para serviço do ContaAzul', {
            orderId,
            itemId,
            description: item.description,
          })
        }
      })

      // Inserir vínculos no banco
      if (itemServiceLinks.length > 0) {
        const { error } = await this.supabase
          .from('new_order_items_contaazul_services')
          .insert(itemServiceLinks)

        if (error) {
          logger.error('Erro ao vincular itens aos serviços do ContaAzul', {
            orderId,
            error,
          })
        } else {
          logger.info('Itens vinculados aos serviços com sucesso', {
            orderId,
            totalItems: itemServiceLinks.length,
          })
        }
      }
    } catch (error) {
      logger.error('Erro ao processar vínculos de itens com serviços', { orderId, error })
    }
  }
}
