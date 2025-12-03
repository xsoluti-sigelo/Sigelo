import type { Database } from '@/types/database.types'

export type InvoiceGenerationLog = Database['public']['Tables']['invoice_generation_logs']['Row']
export type InvoiceGenerationLogInsert =
  Database['public']['Tables']['invoice_generation_logs']['Insert']

export type PaymentStatus =
  | 'PENDING'
  | 'INVOICED'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'CANCELLED'
  | 'OVERDUE'
  | 'REFUNDED'

export interface NewEventInvoiceData {
  id: string
  event_id: string
  order_fulfillment_id: string | null
  of_numbers: string[] | null
  invoice_id_conta_azul: string | null
  invoice_number: number | null
  invoice_path?: string | null
  success: boolean
  error_message: string | null
  created_at: string
  payload_sent: Record<string, unknown> | null
  response_payload: Record<string, unknown> | null
}

export interface InvoiceGenerationParams {
  eventId: string
  strategy: 'INDIVIDUAL' | 'CONSOLIDATED'
  orderIds?: string[]
}

export interface InvoiceGenerationResult {
  success: boolean
  invoices?: InvoiceCreatedData[]
  error?: string
  warnings?: string[]
}

export interface InvoiceCreatedData {
  invoiceId: string
  invoiceNumber: number
  ofNumbers: string[]
  orderId: string | null
  totalValue: number
  paymentDueDate: string
  invoicePath?: string | null
}

export interface NewEventData {
  id: string
  number: string
  year: number
  name: string
  date: string
  start_time: string | null
  end_time: string | null
  contract: string | null
  source: string | null
  new_orders: Array<{
    id: string
    number: string
    total_value: number | null
    is_cancelled: boolean | null
    new_order_items?: Array<{
      id: string
      quantity: number
      unit_price: number
      description: string | null
      days: number
      new_order_items_contaazul_services?: Array<{
        contaazul_services: {
          id: string
          contaazul_id: string
          name: string
          codigo: string | null
        } | null
      }>
    }>
  }>
  new_events_contaazul_pessoas?: Array<{
    contaazul_pessoas: {
      id: string
      name: string
      conta_azul_id: string
    } | null
  }>
}

export interface InvoiceSummary {
  eventId: string
  eventNumber: string
  eventYear: number
  eventName: string
  totalInvoices: number
  totalInvoiced: number
  totalPaid: number
  totalPending: number
  invoicesPaid: number
  overallStatus: 'NOT_INVOICED' | 'FULLY_PAID' | 'OVERDUE' | 'INVOICED'
}

export interface PendingPayment {
  id: string
  event_id: string
  order_fulfillment_id: string | null
  event_number: string
  event_year: number
  event_name: string
  of_numbers: string[] | null
  invoice_number: number | null
  invoice_id_conta_azul: string | null
  invoiced_at: string
  urgency: 'OVERDUE' | 'DUE_SOON' | 'DUE_UPCOMING' | 'PENDING'
  days_overdue: number
}
