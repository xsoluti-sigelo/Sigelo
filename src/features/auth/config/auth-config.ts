export const AUTH_ROUTES = {
  LOGIN: '/login',
  CALLBACK: '/auth/callback',
  ERROR: '/auth/error',
  DASHBOARD: '/dashboard',
} as const

export const AUTH_ERRORS = {
  INVALID_LOGIN_CREDENTIALS: 'invalid_login_credentials',
  USER_NOT_FOUND: 'user_not_found',
  SESSION_NOT_FOUND: 'session_not_found',
  INVALID_GRANT: 'invalid_grant',
  UNAUTHORIZED: 'unauthorized',
  NETWORK_ERROR: 'network_error',
  UNKNOWN: 'unknown',
} as const

export const OAUTH_PROVIDERS = {
  GOOGLE: 'google',
} as const

export const SESSION_STORAGE_KEYS = {
  LOGIN_LOGGED: 'login_logged',
  LOGOUT_LOGGED: 'logout_logged',
  LAST_LOGIN: 'last_login',
} as const

export const COOKIE_NAMES = {
  INVITE_TOKEN: 'invite_token',
} as const

export const INVITE_TOKEN = {
  MAX_AGE_DAYS: 7,
  COOKIE_MAX_AGE: 60 * 60 * 24 * 7,
} as const
