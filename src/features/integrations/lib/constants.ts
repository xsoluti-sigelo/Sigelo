export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 10,
  FIRST_PAGE: 1,
} as const

export const SYNC = {
  DEFAULT_BATCH_SIZE: 100,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
} as const

export const FILTERS = {
  MAX_VISIBLE_FILTERS_BEFORE_COLLAPSE: 2,
} as const

export const INTEGRATION_MESSAGES = {
  SYNC_SUCCESS: 'Sincronização concluída com sucesso',
  SYNC_ERROR: 'Erro ao sincronizar',
  SYNC_IN_PROGRESS: 'Sincronizando...',

  CONNECTION_SUCCESS: 'Conectado com sucesso',
  CONNECTION_ERROR: 'Erro ao conectar',
  CONNECTION_LOST: 'Conexão perdida',

  NO_DATA: 'Nenhum dado encontrado',
  LOADING: 'Carregando...',

  AUTH_REQUIRED: 'Autenticação necessária',
  TOKEN_EXPIRED: 'Token expirado',
  TOKEN_REFRESH_SUCCESS: 'Token renovado com sucesso',
  TOKEN_REFRESH_ERROR: 'Erro ao renovar token',
} as const

export const CONTAAZUL_API = {
  DEFAULT_PAGE_SIZE: 100,
  MAX_PAGE_SIZE: 200,
  REQUEST_TIMEOUT_MS: 30000,
} as const
