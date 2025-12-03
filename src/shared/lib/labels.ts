const EventStatusLabelsMap: Record<string, string> = {
  DRAFT: 'Rascunho',
  RECEIVED: 'Recebido',
  VERIFIED: 'Verificado',
  CONFIRMED: 'Confirmado',
  ACTIVE: 'Ativo',
  SCHEDULED: 'Agendado',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluído',
  BILLED: 'Faturado',
  CANCELLED: 'Cancelado',
  INCOMPLETE: 'Incompleto',
  TIME_ERROR: 'Erro de Horário',
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: 'Administrador',
    OPERATOR: 'Operador',
    VIEWER: 'Visualizador',
  }
  return labels[role] || role
}

export function getInviteStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pendente',
    ACCEPTED: 'Aceito',
    EXPIRED: 'Expirado',
    CANCELLED: 'Cancelado',
  }
  return labels[status] || status
}

export function getInviteStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
    ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
    EXPIRED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
  }
  return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200'
}

export function getEventStatusLabel(status: string): string {
  const normalizedStatus = status.toUpperCase().replace(/\s+/g, '_')
  return EventStatusLabelsMap[normalizedStatus] || status
}

export function getUserStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
  }
  return labels[status] || status
}

export function getUserStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
    INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200',
  }
  return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200'
}

export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'purple' | 'teal'

export function getInviteStatusVariant(status: string): BadgeVariant {
  const variants: Record<string, BadgeVariant> = {
    PENDING: 'warning',
    ACCEPTED: 'success',
    EXPIRED: 'neutral',
    CANCELLED: 'error',
  }
  return variants[status] || 'neutral'
}

export function getEventStatusVariant(status: string): BadgeVariant {
  const variants: Record<string, BadgeVariant> = {
    DRAFT: 'neutral',
    ACTIVE: 'success',
    COMPLETED: 'info',
    CANCELLED: 'error',
  }
  return variants[status] || 'neutral'
}

export function getUserStatusVariant(status: string): BadgeVariant {
  const variants: Record<string, BadgeVariant> = {
    ACTIVE: 'success',
    INACTIVE: 'neutral',
  }
  return variants[status] || 'neutral'
}

export function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    paid: 'Pago',
    overdue: 'Vencido',
  }
  return labels[status] || status
}

export function formatInstallments(quantity: number, frequency: string): string {
  if (quantity <= 1) return 'Pagamento único'
  return `${quantity} parcela(s) - ${frequency}`
}
