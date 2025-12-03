import { z } from 'zod'

export interface InviteValidationResult {
  success: boolean
  token?: string
  error?: string
}

export class InviteValidationService {
  private readonly tokenSchema = z.string().min(32, 'Token inválido')

  validateInviteToken(token: string | null): InviteValidationResult {
    if (!token) {
      return {
        success: false,
        error: 'Token não fornecido',
      }
    }

    const result = this.tokenSchema.safeParse(token)

    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message || 'Token inválido',
      }
    }

    return {
      success: true,
      token: result.data,
    }
  }

  validateInviteTokenFromUrl(searchParams: URLSearchParams): InviteValidationResult {
    const token = searchParams.get('token')
    return this.validateInviteToken(token)
  }

  isValidTokenFormat(token: string): boolean {
    return this.tokenSchema.safeParse(token).success
  }
}

export const inviteValidationService = new InviteValidationService()
