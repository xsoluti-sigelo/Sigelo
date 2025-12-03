export type FuelType = 'GASOLINE' | 'DIESEL' | 'FLEX' | 'ELECTRIC' | 'HYBRID' | 'CNG' | 'ETHANOL'

export type SizeCategory = 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE'

export interface Vehicle {
  id: string
  tenant_id: string
  license_plate: string
  model: string
  brand: string
  year: number
  module_capacity: number
  cobli_number?: string | null
  fuel_type?: FuelType | string | null
  size_category?: SizeCategory | string | null
  fuel_consumption_km_per_liter?: number | null
  speed_limit_kmh?: number | null
  tags?: string[] | null
  notes?: string | null
  active: boolean | null
  created_at: string | null
  updated_at: string | null
}
