import { EventType } from '@/features/events/config/event-types'
import { EventStatus } from '@/features/events/config/event-status'
import { EquipmentCategory } from '@/shared/config/enums'

interface EventLocationType {
  id: string
  tenant_id: string
  event_id: string
  raw_address: string
  formatted_address?: string | null
  latitude?: number | null
  longitude?: number | null
  geocoding_status?: string | null
}

interface OrderFulfillmentType {
  id: string
  of_number: string
  is_cancelled: boolean
  of_items?: Array<{
    id: string
    quantity: number
    equipment_types?: {
      id: string
      name: string
      category: EquipmentCategory | string | null
    }
  }>
}

interface PartyType {
  id: string
  display_name: string
  full_name?: string | null
  party_contacts?: Array<{
    id: string
    contact_type: string
    contact_value: string
  }>
}

export interface EventWithRelations {
  id: string
  tenant_id: string
  event_number: string
  title: string
  start_datetime: string | null
  end_datetime: string | null
  event_type: EventType
  client_id: string | null
  status: EventStatus
  created_at: string
  updated_at: string
  parties?: PartyType[]
  contaazul_pessoas?: {
    name: string
    person_type?: string | null
  }
  event_locations?: EventLocationType[]
  event_producers?: EventProducer[]
  order_fulfillments?: OrderFulfillmentType[]
  new_orders?: NewOrder[]
}

export interface EventDetails {
  id: string
  number?: string
  year?: string
  name?: string
  date?: string
  start_date?: string | null
  end_date?: string | null
  start_time?: string
  end_time?: string
  location?: string
  source?: string | null
  event_type?: EventType | string | null
  cleaning_rule?: {
    type?: 'daily' | 'weekly' | string
    time?: string
    daysOfWeek?: string[]
  } | null
  order_fulfillments?: OrderFulfillmentType[]
  event_producers?: EventProducer[]
  contaazul_pessoas?: {
    name: string
    person_type?: string | null
  }
  event_locations?: EventLocationType[]
  title?: string
}

export interface EventProducer {
  id: string
  tenant_id: string
  event_id: string
  party_id: string
  is_primary: boolean
  created_at: string
  parties?: PartyType
}

export interface NewOrderItem {
  id: string
  description: string
  quantity: number
  days: number
  unit_price: number
  item_total: number
}

export interface NewOrder {
  id: string
  number: string
  total_value: number
  is_cancelled: boolean
  new_order_items?: NewOrderItem[]
}
