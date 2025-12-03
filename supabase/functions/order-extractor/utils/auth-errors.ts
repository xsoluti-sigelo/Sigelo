import type { AuthError, AuthErrorType } from '../models/auth.types.ts'

export function createAuthError(
  type: AuthErrorType,
  message: string,
  details?: Record<string, any>,
  retryable: boolean = false,
): AuthError {
  return {
    type,
    message,
    details,
    timestamp: new Date().toISOString(),
    retryable,
  }
}

export function mapOAuthErrorToAuthErrorType(oauthError: string): AuthErrorType {
  const errorMap: Record<string, AuthErrorType> = {
    invalid_grant: 'INVALID_GRANT' as AuthErrorType,
    invalid_client: 'INVALID_CLIENT_CREDENTIALS' as AuthErrorType,
    invalid_request: 'INVALID_AUTHORIZATION_CODE' as AuthErrorType,
    unauthorized_client: 'INVALID_CLIENT_CREDENTIALS' as AuthErrorType,
    access_denied: 'INSUFFICIENT_PERMISSIONS' as AuthErrorType,
    unsupported_grant_type: 'UNKNOWN_ERROR' as AuthErrorType,
    server_error: 'NETWORK_ERROR' as AuthErrorType,
    temporarily_unavailable: 'NETWORK_ERROR' as AuthErrorType,
  }

  return errorMap[oauthError] || ('UNKNOWN_ERROR' as AuthErrorType)
}

export function isRetryableOAuthError(oauthError: string): boolean {
  const retryableErrors = ['server_error', 'temporarily_unavailable', 'timeout']

  return retryableErrors.includes(oauthError)
}

export function formatAuthErrorForLogging(error: AuthError): Record<string, any> {
  return {
    type: error.type,
    message: error.message,
    retryable: error.retryable,
    timestamp: error.timestamp,
    ...error.details,
  }
}

export function isAuthError(error: any): error is AuthError {
  return (
    error &&
    typeof error === 'object' &&
    'type' in error &&
    'message' in error &&
    'timestamp' in error &&
    'retryable' in error
  )
}

export function getAuthErrorMessage(error: AuthError): string {
  const messageMap: Record<string, string> = {
    CREDENTIALS_NOT_FOUND: 'Credenciais não encontradas. Por favor, faça login novamente.',
    TOKEN_EXPIRED: 'Sessão expirada. Por favor, faça login novamente.',
    TOKEN_REFRESH_FAILED: 'Falha ao renovar sessão. Por favor, faça login novamente.',
    INVALID_CLIENT_CREDENTIALS: 'Credenciais do aplicativo inválidas. Contate o suporte.',
    INVALID_AUTHORIZATION_CODE: 'Código de autorização inválido. Por favor, tente novamente.',
    GMAIL_CONNECTION_FAILED: 'Falha ao conectar com Gmail. Verifique sua conexão.',
    DATABASE_ERROR: 'Erro no banco de dados. Tente novamente mais tarde.',
    NETWORK_ERROR: 'Erro de rede. Verifique sua conexão.',
    INVALID_GRANT: 'Autorização inválida ou expirada. Por favor, faça login novamente.',
    INSUFFICIENT_PERMISSIONS: 'Permissões insuficientes. Autorize todas as permissões solicitadas.',
    RATE_LIMIT_EXCEEDED: 'Limite de requisições excedido. Aguarde alguns minutos.',
    UNKNOWN_ERROR: 'Erro desconhecido. Tente novamente.',
  }

  return messageMap[error.type] || error.message
}

export class AuthenticationError extends Error {
  public readonly type: AuthErrorType
  public readonly details?: Record<string, any>
  public readonly retryable: boolean
  public readonly timestamp: string

  constructor(authError: AuthError) {
    super(authError.message)
    this.name = 'AuthenticationError'
    this.type = authError.type
    this.details = authError.details
    this.retryable = authError.retryable
    this.timestamp = authError.timestamp

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthenticationError)
    }
  }

  toJSON(): AuthError {
    return {
      type: this.type,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      retryable: this.retryable,
    }
  }
}
