export interface GmailAuthTokens {
  accessToken: string
  expiresIn: number
  tokenType: string
  scope: string
}

export interface GmailCredentials {
  access_token: string
  refresh_token: string
  expires_at: number
  scope: string
  user_id: string
  gmail_user_id?: string
}

export interface GmailProfile {
  emailAddress: string
  messagesTotal: number
  threadsTotal: number
  historyId: string
  id?: string
}

export interface AuthValidationResult {
  success: boolean
  isAuthenticated: boolean
  hasValidToken: boolean
  tokenExpiresAt?: number
  tokenExpiresInSeconds?: number
  gmailProfile?: GmailProfile
  errors: AuthError[]
  warnings: string[]
  processingTime: number
  timestamp: string
}

export interface ConnectionTestResult {
  isValid: boolean
  profile?: GmailProfile
  responseTime: number
  error?: string
}

export enum AuthErrorType {
  CREDENTIALS_NOT_FOUND = 'CREDENTIALS_NOT_FOUND',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',
  INVALID_CLIENT_CREDENTIALS = 'INVALID_CLIENT_CREDENTIALS',
  INVALID_AUTHORIZATION_CODE = 'INVALID_AUTHORIZATION_CODE',
  GMAIL_CONNECTION_FAILED = 'GMAIL_CONNECTION_FAILED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_GRANT = 'INVALID_GRANT',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AuthError {
  type: AuthErrorType
  message: string
  details?: Record<string, any>
  timestamp: string
  retryable: boolean
}

export interface AuthMetrics {
  operationType: AuthOperationType
  success: boolean
  duration: number
  timestamp: string
  userId?: string
  errorType?: AuthErrorType
  metadata?: Record<string, any>
}

export enum AuthOperationType {
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  TOKEN_EXCHANGE = 'TOKEN_EXCHANGE',
  CONNECTION_VALIDATION = 'CONNECTION_VALIDATION',
  USER_VALIDATION = 'USER_VALIDATION',
  CREDENTIALS_SAVE = 'CREDENTIALS_SAVE',
  CREDENTIALS_RETRIEVE = 'CREDENTIALS_RETRIEVE',
  AUTH_URL_GENERATION = 'AUTH_URL_GENERATION',
}

export interface AuthConfig {
  clientId: string
  clientSecret: string
  refreshToken?: string
  scopes: string[]
  tokenEndpoint: string
  profileEndpoint: string
  gmailApiEndpoint: string
}

export interface TokenCacheState {
  hasToken: boolean
  expiresAt: number
  expiresInSeconds: number
  isExpired: boolean
  needsRefresh: boolean
}

export interface AuthUrlOptions {
  redirectUri: string
  state: string
  scopes?: string[]
  accessType?: 'offline' | 'online'
  prompt?: 'none' | 'consent' | 'select_account'
  loginHint?: string
}

export interface CodeExchangeResult {
  success: boolean
  credentials?: GmailCredentials
  error?: AuthError
  metrics: AuthMetrics
}

export interface CredentialsSaveResult {
  success: boolean
  userId: string
  error?: AuthError
  metrics: AuthMetrics
}

export interface RetryOptions {
  maxRetries: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
}
