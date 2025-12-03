export interface EventInvoice {
  id: string
  invoice_id_conta_azul: string
  invoice_number: number
  of_numbers: string[]
  created_at: string
  success: boolean
  invoice_path?: string | null
}

export interface CreateEventResponse {
  success: true
  eventId: string
}

export interface CreateEventErrorResponse {
  success: false
  error: string
  errors?: Record<string, string[]>
}

export type CreateEventResult = CreateEventResponse | CreateEventErrorResponse

export interface UpdateEventResponse {
  success: true
  eventId: string
}

export interface UpdateEventErrorResponse {
  success: false
  error: string
  errors?: Record<string, string[]>
}

export type UpdateEventResult = UpdateEventResponse | UpdateEventErrorResponse
