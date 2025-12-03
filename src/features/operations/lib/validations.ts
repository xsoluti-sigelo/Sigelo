import { z } from 'zod'
import { OperationType, OperationStatus } from '../config/operations-config'

export const operationTypeSchema = z.nativeEnum(OperationType)

export const molideStatusSchema = z.nativeEnum(OperationStatus)

export type MolideStatusType = z.infer<typeof molideStatusSchema>

export const vehicleTypeSchema = z.enum(['CARGA', 'TANQUE'])

export const molideOperationSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  event_id: z.string().uuid(),
  operation_type: operationTypeSchema,
  operation_date: z.string(),
  operation_time: z.string().nullable(),
  operation_hash: z.string().nullable().optional(),
  event_version: z.number().int().nullable().optional(),
  equipment_standard: z.number().int().nullable().optional(),
  equipment_pcd: z.number().int().nullable().optional(),
  is_executed: z.boolean().nullable().optional(),
  status: molideStatusSchema.default(OperationStatus.SCHEDULED),
  created_at: z.string().optional(),
  updated_at: z.string().optional().nullable(),
  created_by: z.string().uuid().optional().nullable(),
  updated_by: z.string().uuid().optional().nullable(),
})

export const updateOperationSchema = z.object({
  operationId: z.string().min(1, 'ID de operação é obrigatório'),
  data: z
    .object({
      status: molideStatusSchema.optional(),
      started_at: z.string().datetime('Data/hora inválida').optional(),
      completed_at: z.string().datetime('Data/hora inválida').optional(),
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (formato: YYYY-MM-DD)')
        .optional(),
      time: z
        .string()
        .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Horário inválido (formato: HH:MM)')
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Pelo menos um campo deve ser fornecido para atualização',
    }),
})

export const assignmentSchema = z.object({
  operationId: z.string().uuid('ID de operação inválido'),
  partyId: z.string().uuid('ID de pessoa inválido').optional(),
  vehicleId: z.string().uuid('ID de veículo inválido').optional(),
})

export const removeAssignmentSchema = z.object({
  assignmentId: z.string().uuid('ID de atribuição inválido'),
})

export const generateInvoiceSchema = z.object({
  eventId: z.string().uuid('ID do evento inválido'),
})

export const operationCommentSchema = z.object({
  operationId: z.string().uuid('ID de operação inválido'),
  comment: z
    .string()
    .trim()
    .min(1, 'Comentário é obrigatório')
    .max(2000, 'Comentário muito longo'),
})

export const removeOperationCommentSchema = z.object({
  commentId: z.string().uuid('ID de comentário inválido'),
  operationId: z.string().uuid('ID de operação inválido'),
})

export type MolideOperation = z.infer<typeof molideOperationSchema>
export type UpdateOperationInput = z.infer<typeof updateOperationSchema>
export type AssignmentInput = z.infer<typeof assignmentSchema>
export type RemoveAssignmentInput = z.infer<typeof removeAssignmentSchema>
export type GenerateInvoiceInput = z.infer<typeof generateInvoiceSchema>
export type OperationCommentInput = z.infer<typeof operationCommentSchema>
export type RemoveOperationCommentInput = z.infer<typeof removeOperationCommentSchema>

export { OperationTypeLabels as operationTypeLabels, OperationStatusLabels as molideStatusLabels } from '../config/operations-config'

export const vehicleTypeLabels: Record<'CARGA' | 'TANQUE', string> = {
  CARGA: 'Carga',
  TANQUE: 'Tanque',
}
