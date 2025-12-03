export type { FuelType, SizeCategory, Vehicle } from '@/shared/models/vehicle'

export interface GetVehiclesParams {
  page?: number
  limit?: number
  search?: string
}
