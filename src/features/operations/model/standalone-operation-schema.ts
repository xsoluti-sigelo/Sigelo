import { z } from 'zod'
import { operationTypeSchema } from '@/features/operations/lib/validations'
import { addressSchema, orderWithNumberSchema } from '@/shared/schemas'

export { addressSchema }

export const eventInfoSchema = z.object({
  eventNumber: z.string().optional(),
  eventDescription: z.string().min(1, 'Descrição do evento é obrigatória'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  address: addressSchema,
})

export const operationDetailsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido'),
  type: operationTypeSchema,
})

export const ordersSchema = z.array(orderWithNumberSchema).optional()

export const assignmentsSchema = z
  .object({
    vehicleId: z
      .string()
      .refine((val) => !val || z.string().uuid().safeParse(val).success, {
        message: 'ID de veículo inválido',
      })
      .optional(),
    partyId: z
      .string()
      .refine((val) => !val || z.string().uuid().safeParse(val).success, {
        message: 'ID de motorista inválido',
      })
      .optional(),
  })
  .optional()

export const createStandaloneOperationSchema = z.object({
  event: eventInfoSchema,
  operation: operationDetailsSchema,
  orders: ordersSchema,
  assignments: assignmentsSchema,
})

export type CreateStandaloneOperationInput = z.infer<typeof createStandaloneOperationSchema>
