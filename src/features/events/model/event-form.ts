import type { Database } from '@/../types/database.types'

export interface OrderItem {
  id?: string
  description: string
  quantity: number
  days: number
  unit_price: number
  item_total: number
  service_id?: string
}

export interface Order {
  id?: string
  number: string
  date: string
  total_value: number
  is_cancelled: boolean
  items: OrderItem[]
}

export interface Person {
  id?: string
  name: string
  role: 'producer' | 'coordinator'
  phone: string | null
  is_primary?: boolean
}

export interface EventService {
  id?: string
  contaazul_service_id: string
  quantity: number
  unit_price: number
  daily_rate: number
  total_price: number
  notes?: string
  order_id?: string
}

export interface EditEventFormProps {
  eventId: string
  initialData: {
    name: string
    number: string
    year: number
    date: string
    start_date?: string
    end_date?: string
    start_time: string
    end_time: string
    location: string
    contract: string | null
    status: string
    client_id?: string
    services?: string[]
    eventServices?: EventService[]
    people?: Person[]
    orders?: Order[]
    received_date?: string | null
    is_night_event?: boolean | null
    is_intermittent?: boolean | null
    event_type?: 'UNICO' | 'INTERMITENTE' | 'CONTINUO' | null
    cleaning_rule?: {
      type: 'daily' | 'weekly'
      daysOfWeek?: ('DOM' | 'SEG' | 'TER' | 'QUA' | 'QUI' | 'SEX' | 'SAB')[]
      time: string
    } | null
    locationData?: {
      raw_address: string
      street: string | null
      number: string | null
      complement: string | null
      neighborhood: string | null
      city: string | null
      state: string | null
      postal_code: string | null
    }
    source?: string | null
    attachments?: Database['public']['Tables']['event_attachments']['Row'][]
  }
}
