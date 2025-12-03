import { describe, it, expect } from 'vitest'
import { vehicleSchema, updateVehicleSchema } from './vehicle'

describe('Vehicle Validation Schemas', () => {
  describe('vehicleSchema', () => {
    const validVehicle = {
      license_plate: 'ABC-1234',
      model: 'Ducato',
      brand: 'Fiat',
      year: 2023,
      module_capacity: 10,
    }

    it('should accept valid vehicle data', () => {
      const result = vehicleSchema.safeParse(validVehicle)
      expect(result.success).toBe(true)
    })

    it('should reject empty license_plate', () => {
      const invalid = { ...validVehicle, license_plate: '' }
      const result = vehicleSchema.safeParse(invalid)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('obrigatória')
      }
    })

    it('should reject invalid license plate format', () => {
      const invalid = { ...validVehicle, license_plate: '123-ABCD' }
      const result = vehicleSchema.safeParse(invalid)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Formato')
      }
    })

    it('should accept Mercosul plate format', () => {
      const mercosul = { ...validVehicle, license_plate: 'ABC1D23' }
      const result = vehicleSchema.safeParse(mercosul)
      expect(result.success).toBe(true)
    })

    it('should reject lowercase license plate', () => {
      const input = { ...validVehicle, license_plate: 'abc-1234' }
      const result = vehicleSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should reject empty model', () => {
      const invalid = { ...validVehicle, model: '' }
      const result = vehicleSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject model longer than 100 chars', () => {
      const invalid = { ...validVehicle, model: 'a'.repeat(101) }
      const result = vehicleSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject empty brand', () => {
      const invalid = { ...validVehicle, brand: '' }
      const result = vehicleSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject invalid year (too old)', () => {
      const invalid = { ...validVehicle, year: 1899 }
      const result = vehicleSchema.safeParse(invalid)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('1900')
      }
    })

    it('should reject future year', () => {
      const futureYear = new Date().getFullYear() + 2
      const invalid = { ...validVehicle, year: futureYear }
      const result = vehicleSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject non-integer year', () => {
      const invalid = { ...validVehicle, year: 2023.5 }
      const result = vehicleSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject invalid module_capacity', () => {
      const invalid = { ...validVehicle, module_capacity: 0 }
      const result = vehicleSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should accept valid fuel_type', () => {
      const withFuel = { ...validVehicle, fuel_type: 'DIESEL' as const }
      const result = vehicleSchema.safeParse(withFuel)
      expect(result.success).toBe(true)
    })

    it('should accept valid size_category', () => {
      const withSize = { ...validVehicle, size_category: 'LARGE' as const }
      const result = vehicleSchema.safeParse(withSize)
      expect(result.success).toBe(true)
    })

    it('should reject negative fuel_consumption', () => {
      const invalid = { ...validVehicle, fuel_consumption_km_per_liter: -5 }
      const result = vehicleSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject fuel_consumption above 99.99', () => {
      const invalid = { ...validVehicle, fuel_consumption_km_per_liter: 100 }
      const result = vehicleSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject speed_limit above 200', () => {
      const invalid = { ...validVehicle, speed_limit_kmh: 250 }
      const result = vehicleSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should accept notes up to 1000 chars', () => {
      const withNotes = { ...validVehicle, notes: 'a'.repeat(1000) }
      const result = vehicleSchema.safeParse(withNotes)
      expect(result.success).toBe(true)
    })

    it('should reject notes longer than 1000 chars', () => {
      const invalid = { ...validVehicle, notes: 'a'.repeat(1001) }
      const result = vehicleSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('updateVehicleSchema', () => {
    const validUpdate = {
      vehicleId: '123e4567-e89b-12d3-a456-426614174000',
      data: {
        model: 'Updated Model',
      },
    }

    it('should accept valid update data', () => {
      const result = updateVehicleSchema.safeParse(validUpdate)
      expect(result.success).toBe(true)
    })

    it('should reject invalid vehicleId', () => {
      const invalid = { ...validUpdate, vehicleId: 'not-a-uuid' }
      const result = updateVehicleSchema.safeParse(invalid)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('inválido')
      }
    })

    it('should accept partial updates', () => {
      const partial = {
        vehicleId: '123e4567-e89b-12d3-a456-426614174000',
        data: { brand: 'New Brand' },
      }
      const result = updateVehicleSchema.safeParse(partial)
      expect(result.success).toBe(true)
    })

    it('should accept empty data object for partial update', () => {
      const empty = {
        vehicleId: '123e4567-e89b-12d3-a456-426614174000',
        data: {},
      }
      const result = updateVehicleSchema.safeParse(empty)
      expect(result.success).toBe(true)
    })

    it('should reject invalid values in data', () => {
      const invalid = {
        vehicleId: '123e4567-e89b-12d3-a456-426614174000',
        data: { year: 1800 },
      }
      const result = updateVehicleSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })
})
