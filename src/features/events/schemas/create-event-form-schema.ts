import { z } from 'zod'
import { orderItemSchema } from '@/shared/schemas'
import { getNowInBrazil } from '@/shared/lib/date-utils'

const getNowInBrazilForValidation = () => {
  return getNowInBrazil()
}

const orderSchema = z
  .object({
    items: z.array(orderItemSchema.passthrough()).min(1, 'Cada serviço precisa de pelo menos um item'),
  })
  .passthrough()

const personSchema = z
  .object({
    id: z.string().optional().nullable(),
    name: z.string().min(1, 'Nome é obrigatório'),
    role: z.enum(['producer', 'coordinator']),
    phone: z.string().optional().nullable(),
    is_primary: z.boolean().optional(),
  })
  .passthrough()

export const createEventFormSchema = z
  .object({
    name: z.string().min(1, 'Nome do evento é obrigatório'),
    number: z.string().min(1, 'Número do evento é obrigatório'),
    clientId: z.string().min(1, 'Selecione um cliente'),
    startDate: z.string().min(1, 'Data de mobilização é obrigatória'),
    endDate: z.string().min(1, 'Data de desmobilização é obrigatória'),
    startTime: z.string().min(1, 'Horário de mobilização é obrigatório'),
    endTime: z.string().min(1, 'Horário de desmobilização é obrigatório'),
    postalCode: z.string().min(1, 'CEP é obrigatório'),
    locationNumber: z.string().min(1, 'Número do endereço é obrigatório'),
    street: z.string().min(1, 'Rua/Avenida é obrigatória'),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'Bairro é obrigatório'),
    city: z.string().min(1, 'Cidade é obrigatória'),
    locationState: z
      .string()
      .min(2, 'Estado deve ter 2 caracteres')
      .max(2, 'Estado deve ter 2 caracteres'),
    rawAddress: z.string().min(1, 'Endereço completo é obrigatório'),
    orders: z.array(orderSchema).min(1, 'Adicione pelo menos um serviço'),
    people: z.array(personSchema).optional(),
  })
  .superRefine((data, ctx) => {
    const startDateTime = new Date(`${data.startDate}T${data.startTime}`)
    const endDateTime = new Date(`${data.endDate}T${data.endTime}`)
    const now = getNowInBrazilForValidation()

    if (startDateTime < now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['startDate'],
        message: 'A data/hora de mobilização não pode ser anterior ao momento atual',
      })
    }

    if (endDateTime < now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'A data/hora de desmobilização não pode ser anterior ao momento atual',
      })
    }

    if (endDateTime <= startDateTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'A data/hora de desmobilização deve ser posterior à mobilização',
      })
    }
  })

export type CreateEventFormValidationInput = z.infer<typeof createEventFormSchema>
