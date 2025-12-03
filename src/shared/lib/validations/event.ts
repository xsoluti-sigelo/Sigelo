import { z } from 'zod'

const EventType = {
  UNIQUE: 'SINGLE_OCCURRENCE',
  INTERMITTENT: 'INTERMITENTE',
} as const

export const eventTypeSchema = z.enum(['SINGLE_OCCURRENCE', 'INTERMITENTE'])

export const eventStatusSchema = z.enum([
  'DRAFT',
  'ACTIVE',
  'RECEIVED',
  'VERIFIED',
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'BILLED',
  'CANCELLED',
  'INCOMPLETE',
  'CONFIRMED',
])

export const eventTypeLabels: Record<'SINGLE_OCCURRENCE' | 'INTERMITENTE', string> = {
  SINGLE_OCCURRENCE: 'Único',
  INTERMITENTE: 'Intermitente',
}

export const eventStatusLabels: Record<
  | 'DRAFT'
  | 'ACTIVE'
  | 'RECEIVED'
  | 'VERIFIED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'BILLED'
  | 'CANCELLED'
  | 'INCOMPLETE'
  | 'CONFIRMED',
  string
> = {
  DRAFT: 'Rascunho',
  ACTIVE: 'Ativo',
  RECEIVED: 'Recebido',
  VERIFIED: 'Verificado',
  SCHEDULED: 'Agendado',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluído',
  BILLED: 'Faturado',
  CANCELLED: 'Cancelado',
  INCOMPLETE: 'Incompleto',
  CONFIRMED: 'Confirmado',
}

export const eventLocationSchema = z.object({
  raw_address: z.string().min(1, 'Endereço é obrigatório'),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
})

export const createEventSchema = z
  .object({
    client_id: z
      .string()
      .uuid('Cliente inválido')
      .optional()
      .or(z.literal(''))
      .transform((val) => val || undefined),

    title: z.string().min(1, 'Título é obrigatório'),
    event_description: z.string().min(1, 'Descrição é obrigatória'),
    contract_number: z.string().optional(),

    event_date: z.string().min(1, 'Data do evento é obrigatória'),
    end_date: z.string().optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),

    event_type: eventTypeSchema.optional(),

    status: eventStatusSchema.default('DRAFT'),

    location: eventLocationSchema,

    general_observations: z.string().optional(),
    logistics_notes: z.string().optional(),
    billing_notes: z.string().optional(),

    recurrence_type: z.string().optional(),
    recurrence_pattern: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'weekdays']).optional(),
    recurrence_count: z.number().int().positive().optional(),
    recurrence_end_date: z.string().optional(),
    recurrence_days: z.array(z.number().int().min(0).max(6)).optional(),
    selected_weekdays: z.array(z.number().int().min(0).max(6)).optional(),
    cleaning_time: z.string().optional(),

    mobilization_date: z.string().optional(),
    demobilization_date: z.string().optional(),
    pre_cleaning_date: z.string().optional(),
    post_cleaning_date: z.string().optional(),

    contract_evidence: z.string().optional(),
    contract_received_date: z.string().optional(),

    services: z
      .array(
        z.object({
          contaazul_service_id: z.string().uuid('ID do serviço inválido'),
          service_name: z.string(),
          quantity: z.number().int().positive('Quantidade deve ser maior que zero'),
          unit_price: z.number().nonnegative('Preço unitário inválido'),
          daily_rate: z.number().int().nonnegative('Taxa de diárias inválida'),
          total_price: z.number().nonnegative('Preço total inválido'),
          notes: z.string().optional(),
        }),
      )
      .min(1, 'Selecione pelo menos um serviço')
      .optional(),
  })
  .refine(
    (data) => {
      if (data.end_date && data.event_date) {
        return new Date(data.end_date) >= new Date(data.event_date)
      }
      return true
    },
    {
      message: 'Data de término deve ser maior ou igual à data de início',
      path: ['end_date'],
    },
  )
  .refine(
    (data) => {
      if (data.event_type === EventType.INTERMITTENT) {
        return !!(
          data.end_date &&
          data.selected_weekdays &&
          data.selected_weekdays.length > 0 &&
          data.cleaning_time
        )
      }
      return true
    },
    {
      message: 'Evento intermitente requer data de término, dias da semana e horário de limpeza',
      path: ['event_type'],
    },
  )
  .refine(
    (data) => {
      if (data.event_type === EventType.UNIQUE) {
        return !!(data.end_date && data.start_time && data.end_time)
      }
      return true
    },
    {
      message: 'Evento único requer data de término e horários',
      path: ['end_date'],
    },
  )

export const downloadAttachmentSchema = z.object({
  storagePath: z.string().min(1, 'Caminho do arquivo é obrigatório'),
  fileName: z.string().min(1, 'Nome do arquivo é obrigatório'),
})

export const generateOperationsSchema = z.object({
  eventId: z.string().uuid('ID do evento inválido'),
})

export type CreateEventFormData = z.infer<typeof createEventSchema>
export type DownloadAttachmentInput = z.infer<typeof downloadAttachmentSchema>
export type GenerateOperationsInput = z.infer<typeof generateOperationsSchema>
