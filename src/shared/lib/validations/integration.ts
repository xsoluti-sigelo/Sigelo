import { z } from 'zod'

export const oauthCallbackSchema = z.object({
  code: z.string().min(1, 'Código de autorização inválido'),
  state: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
})

export const contaAzulTokensSchema = z.object({
  access_token: z.string().min(1, 'Access token inválido'),
  refresh_token: z.string().min(1, 'Refresh token inválido'),
  expires_in: z.number().positive('Tempo de expiração inválido'),
  token_type: z.string(),
  scope: z.string().optional(),
})

export const oauthCallbackQuerySchema = z.object({
  code: z.string().optional(),
  error: z.string().optional(),
})

export type OAuthCallbackParams = z.infer<typeof oauthCallbackSchema>
export type ContaAzulTokens = z.infer<typeof contaAzulTokensSchema>
export type OAuthCallbackQuery = z.infer<typeof oauthCallbackQuerySchema>
