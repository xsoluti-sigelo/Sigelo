import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { createLogger } from '../utils/logger.ts'

const logger = createLogger({ service: 'EventManagementService' })

enum EventStatus {
  RECEIVED = 'RECEIVED',
  VERIFIED = 'VERIFIED',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BILLED = 'BILLED',
  CANCELLED = 'CANCELLED',
  INCOMPLETE = 'INCOMPLETE',
  TIME_ERROR = 'TIME_ERROR',
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  ACTIVE = 'ACTIVE',
}

type EventType = 'SINGLE_OCCURRENCE' | 'INTERMITENTE' | 'CONTINUO'
type DayOfWeek = 'DOM' | 'SEG' | 'TER' | 'QUA' | 'QUI' | 'SEX' | 'SAB'

interface CleaningRule {
  type: 'daily' | 'weekly'
  daysOfWeek?: DayOfWeek[]
  time: string
}

/**
 * Interface baseada no schema new_events
 */
interface EventData {
  id: string // ID simples (event-9314)
  emailId: string // Referência ao email
  number: string // Número do evento (9314)
  year: number // Ano do evento (2025)
  name: string // Nome/descrição do evento
  date: string // Data do evento (YYYY-MM-DD) - DEPRECATED: use start_date
  start_date?: string // Data de início do evento (YYYY-MM-DD)
  end_date?: string // Data de término do evento (YYYY-MM-DD)
  startTime: string // Horário início (HH:MM:SS)
  endTime: string // Horário fim (HH:MM:SS)
  location: string // Endereço completo
  contract: string // Contrato (CLC0128/2024)
  clientName?: string // Nome do cliente
  clientCnpj?: string // CNPJ do cliente
  isNightEvent: boolean // Atravessa meia-noite?
  isIntermittent: boolean // Tem gaps entre dias?
  receivedDate?: string // Data de recebimento do email (ISO string)
  hasInvalidTime?: boolean // Indica se os horários são inválidos (00:00)
  eventType?: EventType // Tipo do evento (ÚNICO, INTERMITENTE, CONTÍNUO)
  cleaningRule?: CleaningRule // Regra de limpeza para recorrência
}

/**
 * Interface baseada no schema new_orders
 */
interface OrderData {
  id: string // ID simples (order-60382)
  eventId: string // Referência ao evento
  number: string // Número da O.F. (60382)
  date: string // Data da O.F. (YYYY-MM-DD)
  totalValue: number // Valor total
  isCancelled: boolean // Status de cancelamento
  cancellationReason?: string
}

/**
 * Interface para itens da O.F. (new_order_items)
 */
interface OrderItem {
  id: string // ID simples (item-001)
  orderId: string // Referência à O.F.
  description: string // Descrição do equipamento
  quantity: number // Quantidade
  days: number // Número de diárias
  unitPrice: number // Preço unitário
  item_total: number // Total (quantity × days × unitPrice)
}

/**
 * Interface para pessoas (new_people)
 */
interface PersonData {
  id: string
  eventId: string
  name: string
  role: 'producer' | 'coordinator' | 'driver' | 'helper'
  phone?: string
  document?: string
  organization?: string
  isPrimary: boolean
}

interface ManagementResult {
  action: 'created' | 'updated' | 'cancelled_order' | 'cancelled_event' | 'added_order'
  eventId: string
  orderId: string
  message: string
}

export class EventManagementService {
  private supabase: SupabaseClient
  private tenantId: string

  constructor(supabaseUrl: string, supabaseKey: string, tenantId: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.tenantId = tenantId
  }

  /**
   * Infere o tipo de evento baseado nos dados extraídos do email
   * Regras de negócio:
   * - ÚNICO (SINGLE_OCCURRENCE): Eventos de até 3 dias (contratos curtos)
   * - INTERMITENTE: Eventos com flag isIntermittent = true (gaps entre dias)
   * - CONTÍNUO: Eventos longos (mais de 7 dias)
   */
  public inferEventType(startDate: string, endDate: string, isIntermittent: boolean): EventType {
    // Se marcado como intermitente, é INTERMITENTE
    if (isIntermittent) {
      return 'INTERMITENTE'
    }

    // Calcular duração em dias
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 para incluir o dia final

    // Eventos curtos (até 3 dias) são ÚNICO
    if (diffDays <= 3) {
      return 'SINGLE_OCCURRENCE'
    }

    // Eventos longos (mais de 7 dias) são CONTÍNUO
    if (diffDays > 7) {
      return 'CONTINUO'
    }

    // Entre 4 e 7 dias, default para ÚNICO
    return 'SINGLE_OCCURRENCE'
  }

  /**
   * Infere a regra de limpeza baseado no tipo de evento
   * Regras de negócio:
   * - ÚNICO (SINGLE_OCCURRENCE): Limpeza diária às 19:00
   * - INTERMITENTE: Limpeza semanal em todos os dias do período às 19:00
   * - CONTÍNUO: Limpeza semanal em todos os dias do período às 19:00
   */
  public inferCleaningRule(eventType: EventType, startDate: string, endDate: string): CleaningRule {
    const defaultCleaningTime = '19:00'

    if (eventType === 'SINGLE_OCCURRENCE') {
      // ÚNICO: limpeza diária
      return {
        type: 'daily',
        time: defaultCleaningTime,
      }
    }

    // INTERMITENTE e CONTÍNUO: limpeza semanal
    // Extrair todos os dias da semana que existem no período
    const daysOfWeek = this.extractDaysOfWeek(startDate, endDate)

    return {
      type: 'weekly',
      daysOfWeek,
      time: defaultCleaningTime,
    }
  }

  /**
   * Extrai todos os dias da semana que existem entre start_date e end_date
   */
  private extractDaysOfWeek(startDate: string, endDate: string): DayOfWeek[] {
    const daysMap: Record<number, DayOfWeek> = {
      0: 'DOM',
      1: 'SEG',
      2: 'TER',
      3: 'QUA',
      4: 'QUI',
      5: 'SEX',
      6: 'SAB',
    }

    const start = new Date(startDate + 'T00:00:00')
    const end = new Date(endDate + 'T00:00:00')
    const availableDays = new Set<DayOfWeek>()

    const current = new Date(start)
    while (current <= end) {
      const dayOfWeek = daysMap[current.getDay()]
      availableDays.add(dayOfWeek)
      current.setDate(current.getDate() + 1)
    }

    return Array.from(availableDays)
  }

  /**
   * Verifica se um evento já existe no banco de dados
   * Procura pelo NÚMERO do evento (ex: "9314"), não pelo ID completo
   */
  async eventExists(eventNumber: string, eventYear: number): Promise<boolean> {
    logger.info('Verificando existência do evento', { eventNumber, eventYear })

    const { data, error } = await this.supabase
      .from('new_events')
      .select('id')
      .eq('number', eventNumber)
      .eq('year', eventYear)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found
      logger.error('Erro ao verificar evento', { error })
      throw error
    }

    const exists = !!data
    logger.info('Resultado da verificação', { eventNumber, eventYear, exists })
    return exists
  }

  /**
   * Busca um evento existente pelo número e ano
   */
  async getEvent(eventNumber: string, eventYear: number): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('new_events')
      .select('*')
      .eq('number', eventNumber)
      .eq('year', eventYear)
      .single()

    if (error && error.code !== 'PGRST116') {
      logger.error('Erro ao buscar evento', { error })
      throw error
    }

    return data
  }

  /**
   * Conta quantas O.F.s ativas (não canceladas) um evento possui
   */
  async countActiveOrders(eventId: string): Promise<number> {
    logger.info('Contando O.F.s ativas do evento', { eventId })

    const { data, error, count } = await this.supabase
      .from('new_orders')
      .select('id', { count: 'exact', head: false })
      .eq('event_id', eventId)
      .eq('is_cancelled', false)

    if (error) {
      logger.error('Erro ao contar O.F.s', { error })
      throw error
    }

    logger.info('Total de O.F.s ativas', { eventId, count })
    return count || 0
  }

  /**
   * Processa um novo email de evento ou O.F.
   * Aplica as regras de negócio:
   * - Se evento não existe: cria evento + O.F.
   * - Se evento existe + O.F. nova: adiciona O.F. ao evento
   * - Se evento existe + cancelamento + única O.F.: cancela evento e O.F.
   * - Se evento existe + cancelamento + múltiplas O.F.s: cancela apenas a O.F.
   */
  async processEventEmail(
    eventData: EventData,
    orderData: OrderData,
    orderItems: OrderItem[],
    people: PersonData[],
  ): Promise<ManagementResult> {
    logger.info('Processando email de evento', {
      eventNumber: eventData.number,
      eventYear: eventData.year,
      orderId: orderData.id,
      isCancelled: orderData.isCancelled,
    })

    // 1. Verificar se o evento já existe
    const eventAlreadyExists = await this.eventExists(eventData.number, eventData.year)

    // CASO 1: Email de CANCELAMENTO
    if (orderData.isCancelled) {
      if (!eventAlreadyExists) {
        logger.warn('Cancelamento recebido para evento inexistente', {
          eventNumber: eventData.number,
          eventYear: eventData.year,
          orderId: orderData.id,
        })
        return {
          action: 'cancelled_order',
          eventId: eventData.id,
          orderId: orderData.id,
          message: 'Cancelamento ignorado: evento não existe',
        }
      }

      // Buscar evento existente
      const existingEvent = await this.getEvent(eventData.number, eventData.year)

      // Verificar quantas O.F.s ativas existem
      const activeOrdersCount = await this.countActiveOrders(existingEvent.id)

      if (activeOrdersCount <= 1) {
        // Única O.F. ou nenhuma: cancelar evento inteiro
        await this.cancelEvent(existingEvent.id, orderData.cancellationReason)
        await this.cancelOrder(orderData.number, orderData.cancellationReason)

        logger.info('Evento e O.F. cancelados (única O.F.)', {
          eventId: existingEvent.id,
          orderId: orderData.id,
        })

        return {
          action: 'cancelled_event',
          eventId: existingEvent.id,
          orderId: orderData.id,
          message: 'Evento e O.F. cancelados (era a única O.F.)',
        }
      } else {
        // Múltiplas O.F.s: cancelar apenas esta O.F.
        await this.cancelOrder(orderData.number, orderData.cancellationReason)

        logger.info('Apenas O.F. cancelada (múltiplas O.F.s)', {
          eventId: existingEvent.id,
          orderId: orderData.id,
          remainingOrders: activeOrdersCount - 1,
        })

        return {
          action: 'cancelled_order',
          eventId: existingEvent.id,
          orderId: orderData.id,
          message: `O.F. cancelada (evento mantido com ${activeOrdersCount - 1} O.F.s)`,
        }
      }
    }

    // CASO 2: Email NORMAL (não cancelamento)
    if (!eventAlreadyExists) {
      // Evento não existe: criar evento + O.F. + itens + pessoas
      await this.createEvent(eventData)
      await this.createOrder(orderData)
      await this.createOrderItems(orderItems)
      await this.createPeople(people)

      logger.info('Evento e O.F. criados', {
        eventId: eventData.id,
        orderId: orderData.id,
      })

      return {
        action: 'created',
        eventId: eventData.id,
        orderId: orderData.id,
        message: 'Evento e O.F. criados com sucesso',
      }
    } else {
      // Evento existe: adicionar apenas nova O.F. + itens
      await this.createOrder(orderData)
      await this.createOrderItems(orderItems)

      logger.info('Nova O.F. adicionada ao evento existente', {
        eventNumber: eventData.number,
        orderId: orderData.id,
      })

      return {
        action: 'added_order',
        eventId: eventData.id,
        orderId: orderData.id,
        message: 'Nova O.F. adicionada ao evento existente',
      }
    }
  }

  /**
   * Cria um novo evento no banco de dados
   */
  private async createEvent(eventData: EventData): Promise<void> {
    logger.info('Criando evento', { eventId: eventData.id })

    // Determinar status do evento baseado nos horários
    const eventStatus = eventData.hasInvalidTime ? EventStatus.TIME_ERROR : EventStatus.RECEIVED

    const { error } = await this.supabase.from('new_events').insert({
      id: eventData.id,
      tenant_id: this.tenantId,
      email_id: eventData.emailId,
      number: eventData.number,
      year: eventData.year,
      name: eventData.name,
      date: eventData.date,
      start_date: eventData.start_date,
      end_date: eventData.end_date,
      start_time: eventData.startTime,
      end_time: eventData.endTime,
      location: eventData.location,
      contract: eventData.contract,
      is_cancelled: false,
      is_night_event: eventData.isNightEvent,
      is_intermittent: eventData.isIntermittent,
      received_date: eventData.receivedDate,
      source: 'AUTO',
      status: eventStatus, // TIME_ERROR se horário inválido, RECEIVED caso contrário
      event_type: eventData.eventType, // Tipo inferido do evento
      cleaning_rule: eventData.cleaningRule, // Regra de limpeza inferida
      daily_list: eventData.dailies || null, // Lista de datas específicas para eventos intermitentes
      created_at: new Date().toISOString(),
    })

    if (error) {
      logger.error('Erro ao criar evento', { error })
      throw error
    }

    logger.info('Evento criado com sucesso', {
      eventId: eventData.id,
      eventType: eventData.eventType,
      cleaningRule: eventData.cleaningRule,
    })
  }

  /**
   * Cria uma nova O.F. no banco de dados
   */
  private async createOrder(orderData: OrderData): Promise<void> {
    logger.info('Criando O.F.', { orderId: orderData.id })

    const { error } = await this.supabase.from('new_orders').insert({
      id: orderData.id,
      tenant_id: this.tenantId,
      event_id: orderData.eventId,
      number: orderData.number,
      date: orderData.date,
      total_value: orderData.totalValue,
      status: orderData.isCancelled ? 'cancelled' : 'active',
      is_cancelled: orderData.isCancelled,
      cancellation_reason: orderData.cancellationReason,
      created_at: new Date().toISOString(),
    })

    if (error) {
      logger.error('Erro ao criar O.F.', { error })
      throw error
    }

    logger.info('O.F. criada com sucesso', { orderId: orderData.id })
  }

  /**
   * Cria os itens de uma O.F.
   */
  private async createOrderItems(items: OrderItem[]): Promise<void> {
    if (items.length === 0) return

    logger.info('Criando itens da O.F.', { count: items.length })

    const { error } = await this.supabase.from('new_order_items').insert(
      items.map((item) => ({
        id: item.id,
        tenant_id: this.tenantId,
        order_id: item.orderId,
        description: item.description,
        quantity: item.quantity,
        days: item.days,
        unit_price: item.unitPrice,
        item_total: item.item_total,
        created_at: new Date().toISOString(),
      })),
    )

    if (error) {
      logger.error('Erro ao criar itens', { error })
      throw error
    }

    logger.info('Itens criados com sucesso', { count: items.length })
  }

  /**
   * Cria registros de pessoas do evento
   */
  private async createPeople(people: PersonData[]): Promise<void> {
    if (people.length === 0) return

    logger.info('Criando pessoas do evento', { count: people.length })

    const { error } = await this.supabase.from('new_people').insert(
      people.map((person) => ({
        id: person.id,
        event_id: person.eventId,
        name: person.name,
        role: person.role,
        phone: person.phone,
        document: person.document,
        organization: person.organization,
        is_primary: person.isPrimary,
        created_at: new Date().toISOString(),
      })),
    )

    if (error) {
      logger.error('Erro ao criar pessoas', { error })
      throw error
    }

    logger.info('Pessoas criadas com sucesso', { count: people.length })
  }

  /**
   * Cancela um evento (marca como cancelado)
   */
  private async cancelEvent(eventId: string, reason?: string): Promise<void> {
    logger.info('Cancelando evento', { eventId })

    const { error } = await this.supabase
      .from('new_events')
      .update({
        is_cancelled: true,
        status: EventStatus.CANCELLED, // Atualiza o status quando cancela o evento
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)

    if (error) {
      logger.error('Erro ao cancelar evento', { error })
      throw error
    }

    logger.info('Evento cancelado com sucesso', { eventId })
  }

  /**
   * Cancela uma O.F. pelo número (marca como cancelada)
   */
  private async cancelOrder(orderNumber: string, reason?: string): Promise<void> {
    logger.info('Cancelando O.F.', { orderNumber })

    const { error } = await this.supabase
      .from('new_orders')
      .update({
        status: 'cancelled',
        is_cancelled: true,
        cancellation_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('number', orderNumber)

    if (error) {
      logger.error('Erro ao cancelar O.F.', { error })
      throw error
    }

    logger.info('O.F. cancelada com sucesso', { orderNumber })
  }
}
