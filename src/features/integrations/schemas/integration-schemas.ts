import { z } from 'zod'

export const integrationTypeSchema = z.enum(['CONTA_AZUL', 'OUTROS'])

export const contaAzulTokensSchema = z.object({
  access_token: z.string().min(1, 'Access token é obrigatório'),
  refresh_token: z.string().min(1, 'Refresh token é obrigatório'),
  expires_in: z.number().positive('Expiration inválida'),
  expires_at: z.number().positive('Expiration timestamp inválido'),
  token_type: z.string().min(1, 'Token type é obrigatório'),
})

export const integrationCredentialsSchema = z.object({
  access_token: z.string().min(1, 'Access token é obrigatório'),
  refresh_token: z.string().min(1, 'Refresh token é obrigatório'),
  expires_in: z.number().positive('Expiration inválida'),
  expires_at: z.number().positive('Expiration timestamp inválido'),
  token_type: z.string().min(1, 'Token type é obrigatório'),
})

export const integrationSettingsSchema = z.object({
  autoSync: z.boolean().optional(),
  syncInterval: z.number().positive().optional(),
})

export const connectIntegrationSchema = z.object({
  integrationType: integrationTypeSchema,
})

export const disconnectIntegrationSchema = z.object({
  integrationType: integrationTypeSchema,
})

export const syncIntegrationSchema = z.object({
  integrationType: integrationTypeSchema.default('CONTA_AZUL'),
  params: z
    .object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      page: z.number().positive().optional(),
      size: z.number().positive().optional(),
    })
    .optional(),
})

export const refreshTokenSchema = z.object({
  integrationType: integrationTypeSchema.default('CONTA_AZUL'),
})

export type ContaAzulTokensInput = z.infer<typeof contaAzulTokensSchema>
export type IntegrationCredentialsInput = z.infer<typeof integrationCredentialsSchema>
export type IntegrationSettingsInput = z.infer<typeof integrationSettingsSchema>
export type ConnectIntegrationInput = z.infer<typeof connectIntegrationSchema>
export type DisconnectIntegrationInput = z.infer<typeof disconnectIntegrationSchema>
export type SyncIntegrationInput = z.infer<typeof syncIntegrationSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
