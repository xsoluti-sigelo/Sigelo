import { toast } from 'sonner'

export const TOAST_MESSAGES = {
  LIST: {
    UPDATED: 'Lista atualizada!',
  },
  CREATE: {
    SUCCESS: (entity: string) => `${entity} criado com sucesso!`,
    ERROR: (entity: string) => `Erro ao criar ${entity}`,
  },
  UPDATE: {
    SUCCESS: (entity: string) => `${entity} atualizado com sucesso!`,
    ERROR: (entity: string) => `Erro ao atualizar ${entity}`,
  },
  DELETE: {
    SUCCESS: (entity: string) => `${entity} excluído com sucesso!`,
    ERROR: (entity: string) => `Erro ao excluir ${entity}`,
  },
  SAVE: {
    SUCCESS: 'Alterações salvas com sucesso!',
    ERROR: 'Erro ao salvar alterações',
  },
  LOAD: {
    ERROR: 'Erro ao carregar dados',
  },
  VALIDATION: {
    REQUIRED_FIELDS: 'Preencha todos os campos obrigatórios',
    INVALID_FORMAT: 'Formato inválido',
  },
  AUTH: {
    UNAUTHORIZED: 'Você não tem permissão para realizar esta ação',
    SESSION_EXPIRED: 'Sua sessão expirou. Faça login novamente.',
  },
  NETWORK: {
    ERROR: 'Erro de conexão. Tente novamente.',
  },
} as const

export function showSuccessToast(message: string) {
  toast.success(message)
}

export function showErrorToast(message: string) {
  toast.error(message)
}

export function showInfoToast(message: string) {
  toast.info(message)
}

export function showWarningToast(message: string) {
  toast.warning(message)
}

export function showListUpdatedToast() {
  toast.success(TOAST_MESSAGES.LIST.UPDATED)
}

export function showCreateSuccessToast(entity: string) {
  toast.success(TOAST_MESSAGES.CREATE.SUCCESS(entity))
}

export function showCreateErrorToast(entity: string) {
  toast.error(TOAST_MESSAGES.CREATE.ERROR(entity))
}

export function showUpdateSuccessToast(entity: string) {
  toast.success(TOAST_MESSAGES.UPDATE.SUCCESS(entity))
}

export function showUpdateErrorToast(entity: string) {
  toast.error(TOAST_MESSAGES.UPDATE.ERROR(entity))
}

export function showDeleteSuccessToast(entity: string) {
  toast.success(TOAST_MESSAGES.DELETE.SUCCESS(entity))
}

export function showDeleteErrorToast(entity: string) {
  toast.error(TOAST_MESSAGES.DELETE.ERROR(entity))
}

export function showSaveSuccessToast() {
  toast.success(TOAST_MESSAGES.SAVE.SUCCESS)
}

export function showSaveErrorToast() {
  toast.error(TOAST_MESSAGES.SAVE.ERROR)
}

export function showLoadErrorToast() {
  toast.error(TOAST_MESSAGES.LOAD.ERROR)
}

export function showValidationErrorToast(message?: string) {
  toast.error(message || TOAST_MESSAGES.VALIDATION.REQUIRED_FIELDS)
}

export function showUnauthorizedToast() {
  toast.error(TOAST_MESSAGES.AUTH.UNAUTHORIZED)
}

export function showSessionExpiredToast() {
  toast.error(TOAST_MESSAGES.AUTH.SESSION_EXPIRED)
}

export function showNetworkErrorToast() {
  toast.error(TOAST_MESSAGES.NETWORK.ERROR)
}
