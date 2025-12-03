import { z } from 'zod'
import { uuidSchema } from './common'

const LICENSE_PLATE_REGEX = /^[A-Z]{3}[-]?\d{1}[A-Z0-9]\d{2}$/

export const vehicleSchema = z.object({
  license_plate: z
    .string()
    .min(1, 'Placa é obrigatória')
    .regex(LICENSE_PLATE_REGEX, 'Formato de placa inválido (ex: ABC-1234 ou ABC1D23)')
    .transform((val) => val.toUpperCase().replace('-', '')),

  model: z
    .string()
    .min(1, 'Modelo é obrigatório')
    .max(100, 'Modelo deve ter no máximo 100 caracteres'),

  brand: z
    .string()
    .min(1, 'Marca é obrigatória')
    .max(100, 'Marca deve ter no máximo 100 caracteres'),

  year: z
    .number()
    .int('Ano deve ser um número inteiro')
    .min(1900, 'Ano deve ser maior que 1900')
    .max(new Date().getFullYear() + 1, `Ano deve ser no máximo ${new Date().getFullYear() + 1}`),

  module_capacity: z
    .number()
    .int('Capacidade de módulos deve ser um número inteiro')
    .min(1, 'Capacidade deve ser maior que 0'),

  cobli_number: z
    .string()
    .max(50, 'Número Cobli deve ter no máximo 50 caracteres')
    .optional()
    .nullable()
    .or(z.literal('')),

  fuel_type: z
    .enum(['GASOLINE', 'DIESEL', 'FLEX', 'ELECTRIC', 'HYBRID', 'CNG', 'ETHANOL'])
    .optional()
    .nullable(),

  size_category: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE']).optional().nullable(),

  fuel_consumption_km_per_liter: z
    .number()
    .positive('Consumo deve ser maior que 0')
    .max(99.99, 'Consumo deve ser no máximo 99.99 km/l')
    .optional()
    .nullable(),

  speed_limit_kmh: z
    .number()
    .int('Limite de velocidade deve ser um número inteiro')
    .positive('Limite deve ser maior que 0')
    .max(200, 'Limite deve ser no máximo 200 km/h')
    .optional()
    .nullable(),

  tags: z.array(z.string()).optional().nullable(),

  notes: z
    .string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional()
    .nullable()
    .or(z.literal('')),
})

export const updateVehicleSchema = z.object({
  vehicleId: uuidSchema,
  data: vehicleSchema.partial(),
})

export type VehicleFormData = z.infer<typeof vehicleSchema>
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>
