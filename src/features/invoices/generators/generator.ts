import { createClient } from '@/shared/lib/supabase/server'
import {
  createContaAzulClient,
  checkCancellationEmails,
  type ContaAzulClient,
  type ContaAzulCreateSaleResponse,
  type ContaAzulSale,
} from '@/features/integrations/contaazul'
import {
  DEFAULT_CATEGORY,
  DEFAULT_COST_CENTER,
  DEFAULT_PAYMENT_METHOD,
  DEFAULT_RECEIVING_ACCOUNT,
  DEFAULT_SELLER,
  DEFAULT_SERVICE_LOCATION,
  SPTURIS_CUSTOMER_NAME,
} from './constants'
import { buildInvoiceNotes, buildSaleItemsForOF, calculateDailyRates } from './builders'
import type { EventData, InvoiceGenerationResult } from './types'
import { logger } from '@/shared/lib/logger'
import { uploadInvoicePdfToStorage } from '../lib/storage'

async function getEventData(eventId: string, tenantId: string): Promise<EventData> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('new_events')
    .select(
      `
      id,
      number,
      name,
      start_date,
      start_time,
      end_date,
      end_time,
      contract,
      contaazul_pessoas(
        id,
        name,
        conta_azul_id
      ),
      order_fulfillments(
        id,
        of_number,
        is_cancelled,
        of_items(
          quantity,
          unit_price,
          total_price,
          equipment_types(
            name,
            category
          )
        )
      ),
      event_service_items(
        id,
        quantity,
        unit_price,
        total_price,
        daily_rate,
        contaazul_services(
          contaazul_id,
          name,
          rate
        )
      )
    `,
    )
    .eq('id', eventId)
    .eq('tenant_id', tenantId)
    .single()

  if (error || !data) {
    throw new Error(`Failed to fetch event data: ${error?.message}`)
  }

  return data as unknown as EventData
}

async function logInvoiceGeneration(params: {
  eventId: string
  tenantId: string
  userId: string
  orderFulfillmentId?: string
  ofNumber?: string
  invoiceId?: string
  invoiceNumber?: number
  success: boolean
  error?: string
  ofNumbers: string[]
  payloadSent?: Record<string, unknown>
  responsePayload?: Record<string, unknown>
  invoicePath?: string | null
}): Promise<void> {
  const supabase = await createClient()
  await supabase.from('invoice_generation_logs' as never).insert({
    tenant_id: params.tenantId,
    event_id: params.eventId,
    user_id: params.userId,
    order_fulfillment_id: params.orderFulfillmentId,
    of_number: params.ofNumber,
    invoice_id_conta_azul: params.invoiceId,
    invoice_number: params.invoiceNumber,
    of_numbers: params.ofNumbers,
    success: params.success,
    error_message: params.error,
    invoice_path: params.invoicePath || null,
    payload_sent: params.payloadSent as never,
    response_payload: params.responsePayload as never,
    created_at: new Date().toISOString(),
  } as never)
}

async function downloadAndStoreInvoicePdf(params: {
  contaAzulClient: ContaAzulClient
  tenantId: string
  eventId: string
  invoiceId: string
  invoiceNumber: number
  ofNumber: string
}): Promise<string | null> {
  if (!params.invoiceId) {
    return null
  }

  try {
    const pdfBytes = await params.contaAzulClient.downloadSalePdf(params.invoiceId)
    const storagePath = await uploadInvoicePdfToStorage({
      tenantId: params.tenantId,
      eventId: params.eventId,
      invoiceId: params.invoiceId,
      invoiceNumber: params.invoiceNumber,
      pdfBuffer: pdfBytes,
    })

    if (!storagePath) {
      logger.warn('Invoice PDF uploaded but path missing', {
        tenantId: params.tenantId,
        eventId: params.eventId,
        invoiceId: params.invoiceId,
        invoiceNumber: params.invoiceNumber,
        ofNumber: params.ofNumber,
      })
    }

    return storagePath
  } catch (error) {
    logger.error('Failed to download invoice PDF from Conta Azul', error as Error, {
      tenantId: params.tenantId,
      eventId: params.eventId,
      invoiceId: params.invoiceId,
      invoiceNumber: params.invoiceNumber,
      ofNumber: params.ofNumber,
    })
    return null
  }
}

export async function generateInvoiceFromEvent(
  eventId: string,
  tenantId: string,
  userId: string,
): Promise<InvoiceGenerationResult> {
  const warnings: string[] = []
  try {
    const event = await getEventData(eventId, tenantId)

    if (!event.order_fulfillments || event.order_fulfillments.length === 0) {
      return {
        success: false,
        error: 'Event has no Order Fulfillments registered',
      }
    }

    const activeOFs = event.order_fulfillments.filter((of) => !of.is_cancelled)
    if (activeOFs.length === 0) {
      return { success: false, error: 'All Order Fulfillments are cancelled' }
    }

    const isSPTuris = (event.contaazul_pessoas?.name || '')
      .toUpperCase()
      .includes(SPTURIS_CUSTOMER_NAME)

    const customerId = event.contaazul_pessoas?.conta_azul_id
    if (isSPTuris && !customerId) {
      return {
        success: false,
        error: 'SPTuris client ID not found in contaazul_pessoas (conta_azul_id)',
      }
    }

    if (isSPTuris) {
      const ofNumbers = activeOFs.map((of) => of.of_number)
      const cancellationCheck = await checkCancellationEmails(ofNumbers)
      if (cancellationCheck.hasCancellation) {
        return {
          success: false,
          error: `Cancellation emails found for O.F.s: ${cancellationCheck.cancelledOFs.join(', ')}. Invoice must be created manually.`,
          warnings: ['Cancellation emails detected'],
        }
      }
    }

    const startDatetime = event.start_time
      ? `${event.start_date}T${event.start_time}`
      : `${event.start_date}T00:00:00`
    const endDatetime = event.end_date && event.end_time
      ? `${event.end_date}T${event.end_time}`
      : event.end_date
        ? `${event.end_date}T23:59:59`
        : `${event.start_date}T23:59:59`

    const saleDate = new Date(endDatetime).toISOString().split('T')[0]
    const paymentDueDate = new Date(endDatetime)
    paymentDueDate.setDate(paymentDueDate.getDate() + 30)
    const paymentDueDateStr = paymentDueDate.toISOString().split('T')[0]

    const contaAzulClient = await createContaAzulClient(tenantId)
    const generatedInvoices: Array<{
      ofNumber: string
      invoiceId: string
      invoiceNumber: number
      invoicePath?: string | null
    }> = []

    const dailyRates = calculateDailyRates(startDatetime, endDatetime)

    for (const of of activeOFs) {
      const ofItems = buildSaleItemsForOF(of, event.event_service_items, dailyRates)
      if (ofItems.length === 0) {
        logger.info(`O.F. ${of.of_number} has no items to invoice`, {
          eventId,
          ofNumber: of.of_number,
        })
        continue
      }

      const invoiceNotes = buildInvoiceNotes(event)

      const sale: ContaAzulSale = {
        number: parseInt(of.of_number, 10),
        customer: { id: customerId as string },
        saleDate,
        category: DEFAULT_CATEGORY,
        costCenter: DEFAULT_COST_CENTER,
        seller: DEFAULT_SELLER,
        items: ofItems,
        paymentMethod: DEFAULT_PAYMENT_METHOD,
        receivingAccount: DEFAULT_RECEIVING_ACCOUNT,
        paymentCondition: '1x',
        paymentDueDate: paymentDueDateStr,
        paymentNotes: undefined,
        serviceLocation: DEFAULT_SERVICE_LOCATION,
        customerIsSimplesTaxPayer: false,
        invoiceNotes,
        status: 'APPROVED',
      }

      logger.info('Enviando venda para Conta Azul', {
        ofNumber: of.of_number,
        hasInvoiceNotes: !!invoiceNotes,
        invoiceNotesLength: invoiceNotes?.length,
      })

      const createdSale: ContaAzulCreateSaleResponse = await contaAzulClient.createSale(sale)
      const saleId = createdSale.id ?? createdSale.uuid ?? ''
      const saleNumber =
        createdSale.numero ??
        (createdSale as unknown as { number?: number }).number ??
        sale.number ??
        0

      const invoicePath = await downloadAndStoreInvoicePdf({
        contaAzulClient,
        tenantId,
        eventId,
        invoiceId: saleId,
        invoiceNumber: saleNumber,
        ofNumber: of.of_number,
      })

      generatedInvoices.push({
        ofNumber: of.of_number,
        invoiceId: saleId,
        invoiceNumber: saleNumber,
        invoicePath: invoicePath || undefined,
      })

      await logInvoiceGeneration({
        eventId,
        tenantId,
        userId,
        orderFulfillmentId: of.id,
        ofNumber: of.of_number,
        invoiceId: saleId,
        invoiceNumber: saleNumber,
        success: true,
        invoicePath,
        ofNumbers: [of.of_number],
        payloadSent: sale as unknown as Record<string, unknown>,
        responsePayload: createdSale as unknown as Record<string, unknown>,
      })

      logger.info('Invoice created', {
        ofNumber: of.of_number,
        saleId,
        saleNumber,
      })
    }

    if (generatedInvoices.length === 0) {
      return {
        success: false,
        error: 'No sales could be generated. Check O.F. items.',
      }
    }

    return {
      success: true,
      invoices: generatedInvoices,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await logInvoiceGeneration({
      eventId,
      tenantId,
      userId,
      success: false,
      error: errorMessage,
      ofNumbers: [],
    })
    return { success: false, error: errorMessage || 'Erro ao gerar fatura' }
  }
}

export type { InvoiceGenerationResult, EventData }
