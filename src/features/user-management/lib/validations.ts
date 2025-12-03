import { z } from 'zod'
import { emailSchema } from '@/features/auth/model'

export const userRoleSchema = z.enum(['ADMIN', 'OPERATOR', 'VIEWER'], {
  message: 'Função inválida. Escolha ADMIN, OPERATOR ou VIEWER.',
})

export const createInviteSchema = z.object({
  email: emailSchema,
  full_name: z
    .string()
    .min(1, 'Nome completo é obrigatório')
    .max(100, 'Máximo 100 caracteres')
    .trim(),
  role: userRoleSchema,
})

export const updateUserRoleSchema = z.object({
  userId: z.string().uuid('ID de usuário inválido'),
  newRole: userRoleSchema,
})

export const inviteActionSchema = z.object({
  inviteId: z.string().uuid('ID de convite inválido'),
})

export type UserRole = z.infer<typeof userRoleSchema>
export type CreateInviteInput = z.infer<typeof createInviteSchema>
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>
export type InviteActionInput = z.infer<typeof inviteActionSchema>
