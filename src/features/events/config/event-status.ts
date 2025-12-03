export enum EventStatus {
  DRAFT = 'DRAFT',
  RECEIVED = 'RECEIVED',
  VERIFIED = 'VERIFIED',
  CONFIRMED = 'CONFIRMED',
  ACTIVE = 'ACTIVE',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BILLED = 'BILLED',
  CANCELLED = 'CANCELLED',
  INCOMPLETE = 'INCOMPLETE',
  TIME_ERROR = 'TIME_ERROR',
}

export const EventStatusLabels: Record<EventStatus, string> = {
  [EventStatus.DRAFT]: 'Rascunho',
  [EventStatus.RECEIVED]: 'Recebido',
  [EventStatus.VERIFIED]: 'Verificado',
  [EventStatus.CONFIRMED]: 'Confirmado',
  [EventStatus.ACTIVE]: 'Ativo',
  [EventStatus.SCHEDULED]: 'Agendado',
  [EventStatus.IN_PROGRESS]: 'Em Andamento',
  [EventStatus.COMPLETED]: 'Concluído',
  [EventStatus.BILLED]: 'Faturado',
  [EventStatus.CANCELLED]: 'Cancelado',
  [EventStatus.INCOMPLETE]: 'Incompleto',
  [EventStatus.TIME_ERROR]: 'Erro de Horário',
}

export const EventStatusColors: Record<EventStatus, string> = {
  [EventStatus.DRAFT]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  [EventStatus.RECEIVED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  [EventStatus.VERIFIED]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',

  [EventStatus.CONFIRMED]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  [EventStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  [EventStatus.SCHEDULED]: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',

  [EventStatus.IN_PROGRESS]: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',

  [EventStatus.COMPLETED]: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300',
  [EventStatus.BILLED]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',

  [EventStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  [EventStatus.INCOMPLETE]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  [EventStatus.TIME_ERROR]: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-200',
}

export type EventStatusValue =
  | 'DRAFT'
  | 'RECEIVED'
  | 'VERIFIED'
  | 'CONFIRMED'
  | 'ACTIVE'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'BILLED'
  | 'CANCELLED'
  | 'INCOMPLETE'
  | 'TIME_ERROR'

export type EventStatusEnum =
  | EventStatus.DRAFT
  | EventStatus.RECEIVED
  | EventStatus.VERIFIED
  | EventStatus.CONFIRMED
  | EventStatus.ACTIVE
  | EventStatus.SCHEDULED
  | EventStatus.IN_PROGRESS
  | EventStatus.COMPLETED
  | EventStatus.BILLED
  | EventStatus.CANCELLED
  | EventStatus.INCOMPLETE
  | EventStatus.TIME_ERROR
