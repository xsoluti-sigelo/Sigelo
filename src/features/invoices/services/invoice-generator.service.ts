import { createClient } from '@/shared/lib/supabase/server'
import {
  createContaAzulClient,
  type ContaAzulClient,
  type ContaAzulSale,
  type ContaAzulSaleItem,
  type ContaAzulCreateSaleResponse,
} from '@/features/integrations/contaazul'
import { logger } from '@/shared/lib/logger'
import { createAuditLog } from '@/entities/audit-log'
import { createEventChangeLogs } from '@/entities/event-change-log'
import { uploadInvoicePdfToStorage } from '../lib/storage'
import type {
  NewEventData,
  InvoiceGenerationResult,
  InvoiceCreatedData,
  InvoiceGenerationParams,
} from '@/entities/new-event-invoice/model/types'

export class NewEventInvoiceGeneratorService {
  constructor(
    private tenantId: string,
    private userId: string,
  ) {}

  async generateInvoice(params: InvoiceGenerationParams): Promise<InvoiceGenerationResult> {
    try {
      logger.info('Starting invoice generation', {
        eventId: params.eventId,
        requestedStrategy: params.strategy,
      })

      const existingInvoice = await this.checkExistingInvoice(params.eventId)
      if (existingInvoice) {
        return {
          success: false,
          error: `Já existe uma fatura gerada para este evento. Número da venda: ${existingInvoice.invoiceNumber}`,
        }
      }

      const event = await this.getEventData(params.eventId)

      logger.info('Event data loaded', {
        eventId: event.id,
        eventNumber: event.number,
        ordersCount: event.new_orders?.length || 0,
      })

      if (!event.new_orders || event.new_orders.length === 0) {
        return {
          success: false,
          error: 'Evento não possui ordens de serviço',
        }
      }

      const activeOrders = event.new_orders.filter((order) => !order.is_cancelled)
      if (activeOrders.length === 0) {
        return {
          success: false,
          error: 'Todas as ordens de serviço estão canceladas',
        }
      }

      const customerId = event.new_events_contaazul_pessoas?.[0]?.contaazul_pessoas?.conta_azul_id
      if (!customerId) {
        return {
          success: false,
          error: 'Cliente não possui ID do Conta Azul. Sincronize o cliente primeiro.',
        }
      }

      const strategy = params.strategy || this.detectStrategy(event)

      logger.info('Using invoice generation strategy', {
        strategy,
        activeOrdersCount: activeOrders.length,
        customerId,
      })

      if (strategy === 'INDIVIDUAL') {
        return await this.generateIndividualInvoices(event, activeOrders, customerId)
      } else {
        return await this.generateConsolidatedInvoice(event, activeOrders, customerId)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      logger.error('Error generating invoice', { error: errorMessage, params })

      await this.logFailedGeneration(params.eventId, null, errorMessage)

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  private detectStrategy(event: NewEventData): 'INDIVIDUAL' | 'CONSOLIDATED' {
    if (event.source === 'auto') {
      return 'INDIVIDUAL'
    }

    if (event.source === 'manual') {
      return 'CONSOLIDATED'
    }

    return 'INDIVIDUAL'
  }

  private async generateIndividualInvoices(
    event: NewEventData,
    activeOrders: NewEventData['new_orders'],
    customerId: string,
  ): Promise<InvoiceGenerationResult> {
    const contaAzulClient = await createContaAzulClient(this.tenantId)
    const invoices: InvoiceCreatedData[] = []

    for (const order of activeOrders) {
      try {
        const items = this.buildItemsForOrder(order)
        if (items.length === 0) {
          logger.warn('Order has no items to invoice', {
            orderId: order.id,
            orderNumber: order.number,
          })
          continue
        }

        const totalValue = items.reduce((sum, item) => sum + (item.total || 0), 0)
        const saleDate = event.date
        const paymentDueDate = this.calculateDueDate(event.date)

        const nextNumber = await contaAzulClient.getNextSaleNumber()

        logger.info('Next sale number obtained', {
          orderNumber: order.number,
          nextNumber,
        })

        const sale: ContaAzulSale = {
          customer: { id: customerId },
          number: nextNumber,
          saleDate,
          items,
          paymentMethod: 'TRANSFERENCIA_BANCARIA',
          paymentCondition: '1x',
          paymentDueDate,
          paymentNotes: this.buildPaymentNotes(),
          invoiceNotes: this.buildInvoiceNotes(event),
          status: 'APPROVED',
        }

        logger.info('Creating sale for order', {
          orderNumber: order.number,
          totalValue,
          customerId,
          itemsCount: items.length,
          sale,
        })

        const response = await contaAzulClient.createSale(sale)

        logger.info('Conta Azul response received', {
          orderNumber: order.number,
          response,
        })

        const invoiceId = response.id ?? response.uuid ?? ''
        const invoiceNumber = response.numero ?? response.number ?? 0

        const invoicePath = await this.downloadAndStoreInvoicePdf({
          contaAzulClient,
          eventId: event.id,
          invoiceId,
          invoiceNumber,
          ofNumbers: [order.number],
        })

        await this.logSuccessfulGeneration({
          eventId: event.id,
          orderId: order.id,
          ofNumbers: [order.number],
          invoiceId,
          invoiceNumber,
          totalValue,
          paymentDueDate,
          payloadSent: sale,
          responsePayload: response,
          invoicePath,
        })

        invoices.push({
          invoiceId,
          invoiceNumber,
          ofNumbers: [order.number],
          orderId: order.id,
          totalValue,
          paymentDueDate,
          invoicePath: invoicePath || undefined,
        })

        logger.info('Invoice created successfully', {
          orderNumber: order.number,
          invoiceId,
          invoiceNumber,
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        const errorStack = error instanceof Error ? error.stack : undefined

        logger.error('Error creating invoice for order', {
          error: errorMessage,
          errorStack,
          orderId: order.id,
          orderNumber: order.number,
          fullError: error,
        })

        const userFriendlyMessage = this.getUserFriendlyErrorMessage(errorMessage, [order.number])

        await this.logFailedGeneration(event.id, order.id, userFriendlyMessage, [order.number])

        continue
      }
    }

    if (invoices.length === 0) {
      return {
        success: false,
        error: 'Nenhuma fatura pôde ser gerada',
      }
    }

    return {
      success: true,
      invoices,
    }
  }

  private async generateConsolidatedInvoice(
    event: NewEventData,
    activeOrders: NewEventData['new_orders'],
    customerId: string,
  ): Promise<InvoiceGenerationResult> {
    const contaAzulClient = await createContaAzulClient(this.tenantId)

    try {
      const allItems: ContaAzulSaleItem[] = []

      for (const order of activeOrders) {
        const items = this.buildItemsForOrder(order)
        allItems.push(...items)
      }

      if (allItems.length === 0) {
        return {
          success: false,
          error: 'Nenhum item para faturar',
        }
      }

      const totalValue = allItems.reduce((sum, item) => sum + (item.total || 0), 0)
      const ofNumbers = activeOrders.map((o) => o.number)
      const saleDate = event.date
      const paymentDueDate = this.calculateDueDate(event.date)

      const nextNumber = await contaAzulClient.getNextSaleNumber()

      logger.info('Next sale number obtained for consolidated invoice', {
        ofNumbers,
        nextNumber,
      })

      const sale: ContaAzulSale = {
        customer: { id: customerId },
        number: nextNumber,
        saleDate,
        items: allItems,
        paymentMethod: 'TRANSFERENCIA_BANCARIA',
        paymentCondition: '1x',
        paymentDueDate,
        paymentNotes: this.buildPaymentNotes(),
        invoiceNotes: this.buildInvoiceNotes(event),
        status: 'APPROVED',
      }

      logger.info('Creating consolidated sale', {
        ofNumbers,
        totalValue,
        customerId,
        itemsCount: allItems.length,
        sale,
      })

      const response = await contaAzulClient.createSale(sale)

      logger.info('Conta Azul consolidated response received', {
        ofNumbers,
        response,
      })

      const invoiceId = response.id ?? response.uuid ?? ''
      const invoiceNumber = response.numero ?? response.number ?? 0

      const invoicePath = await this.downloadAndStoreInvoicePdf({
        contaAzulClient,
        eventId: event.id,
        invoiceId,
        invoiceNumber,
        ofNumbers,
      })

      await this.logSuccessfulGeneration({
        eventId: event.id,
        orderId: null,
        ofNumbers,
        invoiceId,
        invoiceNumber,
        totalValue,
        paymentDueDate,
        payloadSent: sale,
        responsePayload: response,
        invoicePath,
      })

      logger.info('Consolidated invoice created successfully', {
        invoiceId,
        invoiceNumber,
        ofCount: ofNumbers.length,
      })

      return {
        success: true,
        invoices: [
          {
            invoiceId,
            invoiceNumber,
            ofNumbers,
            orderId: null,
            totalValue,
            paymentDueDate,
            invoicePath: invoicePath || undefined,
          },
        ],
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      const errorStack = error instanceof Error ? error.stack : undefined

      const ofNumbers = activeOrders.map((o) => o.number)

      logger.error('Error creating consolidated invoice', {
        error: errorMessage,
        errorStack,
        ofNumbers,
        fullError: error,
      })

      const userFriendlyMessage = this.getUserFriendlyErrorMessage(errorMessage, ofNumbers)

      await this.logFailedGeneration(event.id, null, userFriendlyMessage, ofNumbers)

      return {
        success: false,
        error: userFriendlyMessage,
      }
    }
  }

  private buildItemsForOrder(order: NewEventData['new_orders'][0]): ContaAzulSaleItem[] {
    if (!order.new_order_items || order.new_order_items.length === 0) {
      return []
    }

    return order.new_order_items.map((item) => {
      const serviceRelation = item.new_order_items_contaazul_services?.[0]
      const contaAzulService = serviceRelation?.contaazul_services
      const serviceId = contaAzulService?.contaazul_id

      let description = ''

      if (item.days && item.days >= 1) {
        description = `${item.days} DIÁRIA${item.days > 1 ? 'S' : ''}`
      } else if (item.description) {
        description = item.description
      } else {
        description = 'Serviço'
      }

      const quantity = item.quantity || 0
      const unitPrice = item.unit_price || 0
      const days = item.days || 1
      const adjustedQuantity = quantity * days
      const total = Math.round(adjustedQuantity * unitPrice * 100) / 100

      return {
        service: serviceId ? { id: serviceId } : undefined,
        quantity: adjustedQuantity,
        unitPrice,
        total,
        description,
      }
    })
  }

  private buildPaymentNotes(): string {
    const notes: string[] = []

    notes.push('Forma de Pagamento')
    notes.push('Banco: 077 - Banco Inter S.A.')
    notes.push('Agência: 0001')
    notes.push('Conta Corrente: 43279227-9')
    notes.push('CNPJ: 57.677.267/0001-35')
    notes.push('Razão Social: Salva-Rio Ltda')

    return notes.join('\n')
  }

  private buildInvoiceNotes(event: NewEventData): string {
    const notes: string[] = []

    notes.push(
      'A ATIVIDADE DE LOCAÇÃO DE BENS MÓVEIS É ISENTA DE EMISSÃO DE NOTA FISCAL CONFORME LEI Nº 8.846 DE 21/01/94.',
    )

    if (event.contract) {
      notes.push(`CONTRATO Nº ${event.contract}`)
    }

    notes.push(`PROCESSO DE COMPRAS Nº 7210.2024/0006306-9`)

    if (event.source !== 'manual') {
      const activeOrders = event.new_orders?.filter((o) => !o.is_cancelled) || []
      if (activeOrders.length > 0) {
        const ofNumbers = activeOrders.map((o) => o.number).join(', ')
        notes.push(`ORDEM DE FORNECIMENTO Nº ${ofNumbers}`)
      }
    }

    notes.push(`EVENTO: ${event.number}/${event.year} - ${event.name}`)

    if (event.date && event.start_time && event.end_time) {
      const eventDate = new Date(event.date).toLocaleDateString('pt-BR')
      const startTime = event.start_time.substring(0, 5)
      const endTime = event.end_time.substring(0, 5)
      notes.push(`PERÍODO: ${eventDate}, de ${startTime}h até ${endTime}h`)
    } else if (event.date) {
      notes.push(`DATA: ${new Date(event.date).toLocaleDateString('pt-BR')}`)
    }

    return notes.join('\n')
  }

  private calculateDueDate(eventDate: string): string {
    const date = new Date(eventDate)
    date.setDate(date.getDate() + 30)
    return date.toISOString().split('T')[0]
  }

  private async logSuccessfulGeneration(data: {
    eventId: string
    orderId: string | null
    ofNumbers: string[]
    invoiceId: string
    invoiceNumber: number
    totalValue: number
    paymentDueDate: string
    payloadSent: ContaAzulSale
    responsePayload: ContaAzulCreateSaleResponse
    invoicePath?: string | null
  }): Promise<void> {
    const supabase = await createClient()

    // Sanitize JSON fields to handle NaN, Infinity, undefined
    const sanitizeForJson = (obj: unknown): unknown => {
      return JSON.parse(
        JSON.stringify(obj, (_key, value) => {
          if (typeof value === 'number' && !Number.isFinite(value)) {
            return null
          }
          return value
        }),
      )
    }

    // Validate UUID format - order_fulfillment_id column is UUID type
    const isValidUuid = (str: string | null): boolean => {
      if (!str) return false
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      return uuidRegex.test(str)
    }

    const log = {
      tenant_id: this.tenantId,
      user_id: this.userId,
      new_event_id: data.eventId,
      new_order_id: data.orderId || null,
      order_fulfillment_id: isValidUuid(data.orderId) ? data.orderId : null,
      of_numbers: data.ofNumbers,
      invoice_id_conta_azul: data.invoiceId || null,
      invoice_number: data.invoiceNumber || null,
      total_value: Number.isFinite(data.totalValue) ? data.totalValue : 0,
      payment_status: 'INVOICED',
      payment_due_date: data.paymentDueDate || null,
      success: true,
      invoice_path: data.invoicePath || null,
      payload_sent: sanitizeForJson(data.payloadSent),
      response_payload: sanitizeForJson(data.responsePayload),
      created_at: new Date().toISOString(),
    }

    logger.info('Attempting to insert invoice generation log', { log })

    const { error } = await supabase.from('invoice_generation_logs').insert(log as never)

    if (error) {
      logger.error('Failed to insert invoice generation log', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        log,
      })
    }

    await createAuditLog({
      action: 'GENERATE',
      entityType: 'invoice',
      entityId: data.invoiceId,
      description: `Gerou fatura das OF ${data.ofNumbers.join(', ') || 'N/A'}`,
      metadata: {
        invoice_number: data.invoiceNumber,
        of_numbers: data.ofNumbers,
        order_id: data.orderId,
        total_value: data.totalValue,
      },
      tenantId: this.tenantId,
      userId: this.userId,
    })

    const changeLogResult = await createEventChangeLogs({
      eventId: data.eventId,
      tenantId: this.tenantId,
      changedBy: this.userId,
      entity: 'EVENT',
      action: 'UPDATED',
      changes: [
        {
          field: 'invoice',
          oldValue: null,
          newValue: {
            invoice_number: data.invoiceNumber,
            invoice_id: data.invoiceId,
            total_value: data.totalValue,
            of_numbers: data.ofNumbers,
          },
        },
      ],
      source: 'invoice-generator',
      context: {
        reason: 'invoice_generated',
        of_numbers: data.ofNumbers,
        order_id: data.orderId,
        invoice_number: data.invoiceNumber,
      },
    })

    if (!changeLogResult.success) {
      logger.warn('Failed to record invoice generation change log', {
        eventId: data.eventId,
        error: changeLogResult.error,
      })
    }
  }

  private async downloadAndStoreInvoicePdf(params: {
    contaAzulClient: ContaAzulClient
    eventId: string
    invoiceId: string
    invoiceNumber: number
    ofNumbers: string[]
  }): Promise<string | null> {
    if (!params.invoiceId) {
      return null
    }

    try {
      const pdfBytes = await params.contaAzulClient.downloadSalePdf(params.invoiceId)
      const storagePath = await uploadInvoicePdfToStorage({
        tenantId: this.tenantId,
        eventId: params.eventId,
        invoiceId: params.invoiceId,
        invoiceNumber: params.invoiceNumber,
        pdfBuffer: pdfBytes,
      })

      if (!storagePath) {
        logger.warn('Invoice PDF could not be stored', {
          eventId: params.eventId,
          invoiceId: params.invoiceId,
          invoiceNumber: params.invoiceNumber,
          ofNumbers: params.ofNumbers,
        })
      }

      return storagePath
    } catch (error) {
      logger.error('Failed to download invoice PDF from Conta Azul', error as Error, {
        eventId: params.eventId,
        invoiceId: params.invoiceId,
        invoiceNumber: params.invoiceNumber,
        ofNumbers: params.ofNumbers,
      })
      return null
    }
  }

  private async logFailedGeneration(
    eventId: string,
    orderId: string | null,
    errorMessage: string,
    ofNumbers?: string[],
  ): Promise<void> {
    const supabase = await createClient()

    // Validate UUID format - order_fulfillment_id column is UUID type
    const isValidUuid = (str: string | null): boolean => {
      if (!str) return false
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      return uuidRegex.test(str)
    }

    const log = {
      tenant_id: this.tenantId,
      user_id: this.userId,
      new_event_id: eventId,
      new_order_id: orderId || null,
      order_fulfillment_id: isValidUuid(orderId) ? orderId : null,
      of_numbers: ofNumbers || [],
      success: false,
      error_message: errorMessage,
      created_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('invoice_generation_logs').insert(log as never)

    if (error) {
      logger.error('Failed to insert failed generation log', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        log,
      })
    }

    await createAuditLog({
      action: 'GENERATE',
      entityType: 'invoice',
      entityId: orderId,
      description: `Falha ao gerar fatura ${ofNumbers?.join(', ') || ''}`,
      metadata: {
        error: errorMessage,
        of_numbers: ofNumbers || [],
        order_id: orderId,
      },
      tenantId: this.tenantId,
      userId: this.userId,
      success: false,
      errorMessage: errorMessage,
    })
  }

  private async checkExistingInvoice(
    eventId: string,
  ): Promise<{ invoiceNumber: number; invoiceId: string } | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('invoice_generation_logs')
      .select('invoice_number, invoice_id_conta_azul')
      .eq('new_event_id', eventId)
      .eq('success', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      logger.error('Failed to check existing invoice', {
        error: error.message,
        eventId,
      })
      return null
    }

    if (data) {
      return {
        invoiceNumber: (data as { invoice_number: number }).invoice_number,
        invoiceId: (data as { invoice_id_conta_azul: string }).invoice_id_conta_azul,
      }
    }

    return null
  }

  private getUserFriendlyErrorMessage(errorMessage: string, ofNumbers: string[]): string {
    if (errorMessage.includes('número da venda informado já foi utilizado')) {
      return `A venda para a${ofNumbers.length > 1 ? 's' : ''} O.F. ${ofNumbers.join(', ')} pode já ter sido criada no Conta Azul. Verifique se a fatura já existe antes de criar uma nova. Detalhes: ${errorMessage}`
    }

    if (errorMessage.includes('401') || errorMessage.toLowerCase().includes('unauthorized')) {
      return 'Erro de autenticação com o Conta Azul. Verifique se as credenciais estão atualizadas e tente novamente.'
    }

    if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('too many requests')) {
      return 'Limite de requisições excedido na API do Conta Azul. Aguarde alguns minutos e tente novamente.'
    }

    if (
      errorMessage.includes('500') ||
      errorMessage.toLowerCase().includes('internal server error')
    ) {
      return 'Erro no servidor do Conta Azul. Tente novamente mais tarde.'
    }

    if (errorMessage.includes('400') || errorMessage.toLowerCase().includes('bad request')) {
      return `Erro ao validar os dados da venda (O.F. ${ofNumbers.join(', ')}). ${errorMessage}`
    }

    return errorMessage
  }

  private async getEventData(eventId: string): Promise<NewEventData> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('new_events')
      .select(
        `
        id,
        number,
        year,
        name,
        date,
        start_time,
        end_time,
        contract,
        source,
        new_orders (
          id,
          number,
          total_value,
          is_cancelled,
          new_order_items (
            id,
            quantity,
            unit_price,
            description,
            days,
            new_order_items_contaazul_services (
              contaazul_services (
                id,
                contaazul_id,
                name,
                codigo
              )
            )
          )
        ),
        new_events_contaazul_pessoas (
          contaazul_pessoas (
            id,
            name,
            conta_azul_id
          )
        )
      `,
      )
      .eq('id', eventId)
      .single()

    if (error || !data) {
      throw new Error(`Failed to fetch event data: ${error?.message}`)
    }

    return data as unknown as NewEventData
  }
}
