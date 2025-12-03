import type { Database } from '@/types/database.types'

export interface GetEventsParams {
  page?: number
  limit?: number
  search?: string
  client_id?: string
  status?: string
  start_date?: string
  end_date?: string
}

export interface NewEventQueryResult {
  id: string
  number: string
  year: number
  name: string
  date: string
  start_date?: string | null
  end_date?: string | null
  start_time: string
  end_time: string
  location: string
  contract: string
  is_night_event: boolean
  is_intermittent: boolean
  event_type: string | null
  status: Database['public']['Enums']['event_status_enum'] | null
  created_at: string
  new_orders?: Array<{
    id: string
    number: string
    total_value: number
    is_cancelled: boolean
  }>
  new_events_contaazul_pessoas?: Array<{
    contaazul_pessoas: {
      name: string
      cnpj: string
    } | null
  }> | null
  new_emails?: {
    received_at: string
  } | null
}
