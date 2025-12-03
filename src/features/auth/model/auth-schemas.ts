import { z } from 'zod'

export const emailSchema = z.string().email('Email inválido')

export const loginSchema = z.object({
  email: emailSchema,
})

export const inviteTokenSchema = z.string().uuid('Token de convite inválido')

export const sessionSchema = z.object({
  access_token: z.string().min(1, 'Token de acesso inválido'),
  refresh_token: z.string().min(1, 'Token de refresh inválido'),
  expires_at: z.number().positive('Expiração inválida'),
  user: z.object({
    id: z.string().uuid('ID de usuário inválido'),
    email: z.string().email('Email inválido'),
  }),
})

export const userMetadataSchema = z.object({
  full_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  picture: z.string().url().optional(),
  name: z.string().optional(),
})

export const oauthProviderSchema = z.enum(['google'])

export type LoginInput = z.infer<typeof loginSchema>
export type SessionData = z.infer<typeof sessionSchema>
export type UserMetadata = z.infer<typeof userMetadataSchema>
