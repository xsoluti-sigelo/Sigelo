export interface InvoiceGenerationLog {
  id: string
  invoice_number: number | null
  of_numbers: string[] | null
  created_at: string
  invoice_id_conta_azul: string | null
  success: boolean
  new_event_id?: string | null
  new_order_id?: string | null
  order_fulfillment_id?: string | null
  invoice_path?: string | null
}
