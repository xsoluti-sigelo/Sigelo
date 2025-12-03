import { createClient } from '@/shared/lib/supabase/server'
import type { Database } from '@/types/database.types'
import { EquipmentCategory, OrderFulfillmentStatus } from '@/shared/config/enums'

export type SupabaseClient = Awaited<ReturnType<typeof createClient>>

export type UserContext = {
  id: string
  tenant_id: string
}

export type EventRow = Database['public']['Tables']['new_events']['Row']
export type NewOrderRow = Database['public']['Tables']['new_orders']['Row']
export type NewOrderItemRow = Database['public']['Tables']['new_order_items']['Row']

export type { Party, PartyContact, PartyRole } from '@/shared/models/party'

export interface EventLocation {
  id: string
  tenant_id: string
  event_id: string
  raw_address: string
  street?: string | null
  number?: string | null
  complement?: string | null
  neighborhood?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  latitude?: number | null
  longitude?: number | null
  geocoded_address?: string | null
  formatted_address?: string | null
  place_id?: string | null
  geocoding_status?: string | null
  geocoded_at?: string | null
  geocoding_error?: string | null
  created_at: string
  updated_at: string
}

export interface OrderFulfillment {
  id: string
  tenant_id: string
  event_id: string
  of_number: string
  of_status: OrderFulfillmentStatus
  is_cancelled: boolean
  created_at: string
  updated_at: string
  of_items?: OfItem[]
}

export interface OfItem {
  id: string
  tenant_id: string
  of_id: string
  quantity: number
  unit_price: number
  daily_rate: number
  total_price: number
  created_at: string
  updated_at: string
  equipment_types?: EquipmentType
}

export interface OfItemDisplay {
  id: string
  quantity: number
  equipment_types?: {
    id: string
    name: string
    category: EquipmentCategory | string | null
  }
}

export interface OrderFulfillmentDisplay {
  id: string
  of_number: string
  is_cancelled: boolean
  of_status: OrderFulfillmentStatus
  of_items?: OfItemDisplay[]
}

export interface EquipmentType {
  id: string
  tenant_id: string
  name: string
  code: string
  category: EquipmentCategory
  active: boolean
  created_at: string
  updated_at: string
}

export type { Vehicle } from '@/shared/models/vehicle'
