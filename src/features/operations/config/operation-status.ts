export enum OperationStatus {
  SCHEDULED = 'SCHEDULED',
  RECEIVED = 'RECEIVED',
  VERIFIED = 'VERIFIED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  INCOMPLETE = 'INCOMPLETE',
  TIME_ERROR = 'TIME_ERROR',
  NOT_FULFILLED = 'NOT_FULFILLED',
}

export const OperationStatusLabels: Record<OperationStatus, string> = {
  [OperationStatus.SCHEDULED]: 'Agendado',
  [OperationStatus.RECEIVED]: 'Recebido',
  [OperationStatus.VERIFIED]: 'Verificado',
  [OperationStatus.IN_PROGRESS]: 'Em Andamento',
  [OperationStatus.COMPLETED]: 'Concluído',
  [OperationStatus.CANCELLED]: 'Cancelado',
  [OperationStatus.INCOMPLETE]: 'Incompleto',
  [OperationStatus.TIME_ERROR]: 'Erro de Horário',
  [OperationStatus.NOT_FULFILLED]: 'Não Atendido',
}

export const OperationStatusColors: Record<OperationStatus, string> = {
  [OperationStatus.SCHEDULED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  [OperationStatus.RECEIVED]:
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  [OperationStatus.VERIFIED]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  [OperationStatus.IN_PROGRESS]:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  [OperationStatus.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  [OperationStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  [OperationStatus.INCOMPLETE]:
    'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  [OperationStatus.TIME_ERROR]:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  [OperationStatus.NOT_FULFILLED]:
    'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
}

export type OperationStatusValue =
  | 'SCHEDULED'
  | 'RECEIVED'
  | 'VERIFIED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'INCOMPLETE'
  | 'TIME_ERROR'
  | 'NOT_FULFILLED'
export type OperationStatusEnum =
  | OperationStatus.SCHEDULED
  | OperationStatus.RECEIVED
  | OperationStatus.VERIFIED
  | OperationStatus.IN_PROGRESS
  | OperationStatus.COMPLETED
  | OperationStatus.CANCELLED
  | OperationStatus.INCOMPLETE
  | OperationStatus.TIME_ERROR
  | OperationStatus.NOT_FULFILLED
