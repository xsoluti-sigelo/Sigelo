import { AUTH_ERRORS } from '../config/auth-config'
import type { AuthError } from '../model/types'

export function mapAuthError(error: unknown): AuthError {
  if (!error) {
    return {
      message: 'Erro ao processar autenticação',
      code: AUTH_ERRORS.UNKNOWN,
    }
  }

  const supabaseError = error as { message?: string; code?: string; status?: number }
  const errorMessage = supabaseError.message?.toLowerCase() || ''

  if (
    errorMessage.includes('invalid login credentials') ||
    errorMessage.includes('invalid credentials')
  ) {
    return {
      message: 'Credenciais inválidas',
      code: AUTH_ERRORS.INVALID_LOGIN_CREDENTIALS,
    }
  }

  if (errorMessage.includes('user not found')) {
    return {
      message: 'Usuário não encontrado',
      code: AUTH_ERRORS.USER_NOT_FOUND,
    }
  }

  if (errorMessage.includes('session not found') || errorMessage.includes('no session')) {
    return {
      message: 'Sessão expirada. Faça login novamente',
      code: AUTH_ERRORS.SESSION_NOT_FOUND,
    }
  }

  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return {
      message: 'Erro de conexão. Tente novamente',
      code: AUTH_ERRORS.NETWORK_ERROR,
    }
  }

  if (supabaseError.status === 401) {
    return {
      message: 'Você não tem permissão para acessar esta página',
      code: AUTH_ERRORS.UNAUTHORIZED,
    }
  }

  return {
    message: supabaseError.message || 'Erro ao processar autenticação',
    code: supabaseError.code || AUTH_ERRORS.UNKNOWN,
  }
}

export function isNetworkError(error: AuthError): boolean {
  return error.code === AUTH_ERRORS.NETWORK_ERROR
}

export function isInvalidCredentialsError(error: AuthError): boolean {
  return error.code === AUTH_ERRORS.INVALID_LOGIN_CREDENTIALS
}

export function isSessionExpiredError(error: AuthError): boolean {
  return error.code === AUTH_ERRORS.SESSION_NOT_FOUND
}

export function isRecoverableError(error: AuthError): boolean {
  return isNetworkError(error) || isSessionExpiredError(error)
}
