export const APP_NAME = 'Sigelo'
export const APP_DESCRIPTION = 'Sistema inteligente de gerenciamento de locação'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  AUTH_CALLBACK: '/auth/callback',
  AUTH_ERROR: '/auth/error',
  ACCEPT_INVITE: (token: string) => `/accept-invite/${token}`,

  CLIENTS: '/clientes',
  CLIENTS_NEW: '/clientes/novo',
  CLIENT_DETAILS: (id: string) => `/clientes/${id}`,
  CLIENT_EDIT: (id: string) => `/clientes/${id}/editar`,

  EMPLOYEES: '/funcionarios',
  EMPLOYEES_NEW: '/funcionarios/novo',
  EMPLOYEE_DETAILS: (id: string) => `/funcionarios/${id}`,
  EMPLOYEE_EDIT: (id: string) => `/funcionarios/${id}/editar`,

  VEHICLES: '/veiculos',
  VEHICLES_NEW: '/veiculos/novo',
  VEHICLE_DETAILS: (id: string) => `/veiculos/${id}`,
  VEHICLE_EDIT: (id: string) => `/veiculos/${id}/editar`,

  EVENTS: '/eventos',
  EVENTS_CREATE: '/eventos/criar',
  EVENT_DETAILS: (id: string) => `/eventos/${id}`,
  EVENT_EDIT: (id: string) => `/eventos/${id}/editar`,

  OPERATIONS: '/operacoes',
  OPERATION_DETAILS: (id: string) => `/operacoes/${id}`,

  CALENDAR: '/calendario',

  INTEGRATIONS_BASE: '/integracoes',
  INTEGRATIONS: '/integracoes/conexao',
  INTEGRATIONS_CLIENTS: '/integracoes/clientes',
  INTEGRATIONS_SERVICES: '/integracoes/servicos',

  USERS: '/usuarios',
  USERS_INVITES: '/usuarios/convites',
  USERS_INVITES_NEW: '/usuarios/convites/novo',

  AUDIT: '/auditoria',
} as const

export const SESSION_CONFIG = {
  MAX_AGE: Number(process.env.SESSION_MAX_AGE) || 28800,
  REFRESH_MAX_AGE: Number(process.env.REFRESH_TOKEN_MAX_AGE) || 2592000,
} as const

export const COOKIE_CONFIG = {
  SECURE: process.env.SECURE_COOKIES === 'true',
} as const
