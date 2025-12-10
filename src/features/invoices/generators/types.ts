import type { ContaAzulSaleItem } from '@/features/integrations/contaazul'

export interface InvoiceGenerationResult {
  success: boolean
  invoiceId?: string
  invoiceNumber?: number
  invoicePath?: string | null
  invoices?: Array<{
    ofNumber: string
    invoiceId: string
    invoiceNumber: number
    invoicePath?: string | null
  }>
  error?: string
  warnings?: string[]
}

export interface EventData {
  id: string
  number: string
  name: string
  start_date: string
  start_time?: string | null
  end_date?: string | null
  end_time?: string | null
  contract?: string | null
  contaazul_pessoas?: {
    id?: string
    name?: string
    conta_azul_id?: string
  } | null
  order_fulfillments?: Array<{
    id: string
    of_number: string
    is_cancelled: boolean
    of_items?: Array<{
      quantity: number
      unit_price: number
      total_price: number
      equipment_types?: {
        name: string
        category: 'BANHEIRO_PADRAO' | 'BANHEIRO_PCD'
      }
    }>
  }>
}

export type OrderFulfillment = NonNullable<EventData['order_fulfillments']>[number]

export type SaleItemsBuilder = (
  of: OrderFulfillment,
  dailyRates?: number,
) => ContaAzulSaleItem[]
