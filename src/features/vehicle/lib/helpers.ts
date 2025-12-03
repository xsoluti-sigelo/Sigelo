import type { FuelType, SizeCategory } from '../types'
import { FUEL_TYPE_LABELS, SIZE_CATEGORY_LABELS } from './constants'

export function formatLicensePlate(plate: string): string {
  const cleaned = plate.replace(/[^A-Z0-9]/gi, '')

  if (cleaned.length === 7) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
  }

  return plate
}

export function getFuelTypeLabel(fuelType: FuelType | string | null | undefined): string {
  return fuelType ? FUEL_TYPE_LABELS[fuelType as FuelType] || '-' : '-'
}

export function getSizeCategoryLabel(category: SizeCategory | string | null | undefined): string {
  return category ? SIZE_CATEGORY_LABELS[category as SizeCategory] || '-' : '-'
}

export function formatModuleCapacity(capacity: number): string {
  return `${capacity} ${capacity === 1 ? 'módulo' : 'módulos'}`
}

export function formatFuelConsumption(consumption: number | null | undefined): string {
  if (!consumption) return '-'
  return `${consumption.toFixed(2)} km/l`
}

export function formatSpeedLimit(limit: number | null | undefined): string {
  if (!limit) return '-'
  return `${limit} km/h`
}
