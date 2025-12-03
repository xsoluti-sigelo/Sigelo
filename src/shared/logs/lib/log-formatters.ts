import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { ActionType, JsonValue } from '../types'

export const actionTypeLabels: Record<ActionType, string> = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  CREATE_EVENT: 'Criar Evento',
  UPDATE_EVENT: 'Atualizar Evento',
  DELETE_EVENT: 'Deletar Evento',
  GENERATE_INVOICE: 'Gerar Nota Fiscal',
  CREATE_CLIENT: 'Criar Cliente',
  UPDATE_CLIENT: 'Atualizar Cliente',
  DELETE_CLIENT: 'Deletar Cliente',
  CREATE_EMPLOYEE: 'Criar Funcionário',
  UPDATE_EMPLOYEE: 'Atualizar Funcionário',
  DELETE_EMPLOYEE: 'Deletar Funcionário',
  CREATE_USER: 'Criar Usuário',
  UPDATE_USER: 'Atualizar Usuário',
  DELETE_USER: 'Deletar Usuário',
  CREATE_MOLIDE_OPERATION: 'Criar Operação',
  UPDATE_MOLIDE_OPERATION: 'Atualizar Operação',
  DELETE_MOLIDE_OPERATION: 'Deletar Operação',
  ASSIGN_DRIVER: 'Atribuir Motorista',
  ASSIGN_VEHICLE: 'Atribuir Veículo',
  EXPORT_DATA: 'Exportar Dados',
  IMPORT_DATA: 'Importar Dados',
  SYNC_CONTAAZUL_PESSOAS: 'Sincronizar Pessoas (ContaAzul)',
  SYNC_CONTAAZUL_SERVICOS: 'Sincronizar Serviços (ContaAzul)',
}

export function getActionTypeLabel(actionType: ActionType): string {
  return actionTypeLabels[actionType] || actionType
}

export function getActionTypeColor(actionType: ActionType): string {
  if (actionType.includes('CREATE')) {
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
  }
  if (actionType.includes('UPDATE')) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
  }
  if (actionType.includes('DELETE')) {
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  }
  if (actionType.includes('LOGIN') || actionType.includes('LOGOUT')) {
    return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
  }
  if (
    actionType.includes('EXPORT') ||
    actionType.includes('IMPORT') ||
    actionType.includes('SYNC')
  ) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
  }
  if (actionType.includes('ASSIGN') || actionType.includes('GENERATE')) {
    return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
  }
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
}

export function getActionTypeIcon(actionType: ActionType): string {
  if (actionType.includes('CREATE')) return '+'
  if (actionType.includes('UPDATE')) return '✎'
  if (actionType.includes('DELETE')) return '×'
  if (actionType === 'LOGIN') return '→'
  if (actionType === 'LOGOUT') return '←'
  if (actionType.includes('EXPORT')) return '↓'
  if (actionType.includes('IMPORT') || actionType.includes('SYNC')) return '↑'
  if (actionType.includes('ASSIGN')) return '⚡'
  if (actionType === 'GENERATE_INVOICE') return '📄'
  return '•'
}

export function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  return {
    relative: formatDistanceToNow(date, { addSuffix: true, locale: ptBR }),
    absolute: date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    date: date.toLocaleDateString('pt-BR'),
    time: date.toLocaleTimeString('pt-BR'),
    iso: date.toISOString(),
  }
}

export function formatJsonValue(value: JsonValue): string {
  if (value === null) return '-'
  if (typeof value === 'string') return value
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
  if (Array.isArray(value)) {
    const count = value.length
    return count === 1 ? `[1 item]` : `[${count} itens]`
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return '[Objeto]'
    }
  }
  return String(value)
}

export function formatIpAddress(ip: string | null): string {
  if (!ip) return '-'
  if (ip.includes('::ffff:')) {
    return ip.replace('::ffff:', '')
  }
  return ip
}

export function formatUserAgent(userAgent: string | null): string {
  if (!userAgent) return '-'

  const browser = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/)?.[0]
  const os = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/)?.[0]

  if (browser && os) {
    return `${browser.split('/')[0]} (${os})`
  }

  return userAgent.substring(0, 50) + (userAgent.length > 50 ? '...' : '')
}

export function truncateEntityId(entityId: string | null, length = 8): string {
  if (!entityId) return '-'
  if (entityId.length <= length) return entityId
  return `${entityId.substring(0, length)}...`
}

const entityTypeTranslations: Record<string, string> = {
  molide_operation: 'Operação',
  operation: 'Operação',
  event: 'Evento',
  client: 'Cliente',
  employee: 'Funcionário',
  user: 'Usuário',
  vehicle: 'Veículo',
  driver: 'Motorista',
  invoice: 'Nota Fiscal',
  order: 'Pedido',
  order_item: 'Item do Pedido',
  order_fulfillment: 'Atendimento do Pedido',
  contaazul_pessoa: 'Pessoa (ContaAzul)',
  contaazul_service: 'Serviço (ContaAzul)',
}

export function formatEntityType(entityType: string | null): string {
  if (!entityType) return '-'
  return entityTypeTranslations[entityType] || entityType
}

const statusTranslations: Record<string, string> = {
  SCHEDULED: 'Agendado',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  PENDING: 'Pendente',
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  DRAFT: 'Rascunho',
  INCOMPLETE: 'Incompleto',
}

export function formatStatus(status: string): string {
  return statusTranslations[status] || status
}

const operationTypeTranslations: Record<string, string> = {
  CARGA: 'Carga',
  DESCARGA: 'Descarga',
  COLETA: 'Coleta',
  ENTREGA: 'Entrega',
  TRANSFER: 'Transferência',
  DELIVERY: 'Entrega',
  PICKUP: 'Coleta',
  LOADING: 'Carga',
  UNLOADING: 'Descarga',
  MOBILIZATION: 'Mobilização',
  DEMOBILIZATION: 'Desmobilização',
  CLEANING: 'Limpeza',
}

export function formatOperationType(type: string): string {
  return operationTypeTranslations[type] || type
}

const actionTranslations: Record<string, string> = {
  create: 'criar',
  update: 'atualizar',
  delete: 'deletar',
  assign: 'atribuir',
  remove: 'remover',
}

export function translateAction(action: string): string {
  return actionTranslations[action.toLowerCase()] || action
}

const metadataKeyTranslations: Record<string, string> = {
  action: 'Ação',
  changed_to: 'Alterado para',
  'changed to': 'Alterado para',
  changed_from: 'Alterado de',
  'changed from': 'Alterado de',
  previous_value: 'Valor anterior',
  new_value: 'Novo valor',
  event_name: 'Nome do Evento',
  event_number: 'Número do Evento',
  operation_type: 'Tipo de Operação',
  operation_number: 'Número da Operação',
}

export function translateMetadataKey(key: string): string {
  if (metadataKeyTranslations[key]) {
    return metadataKeyTranslations[key]
  }

  const lowerKey = key.toLowerCase()
  if (metadataKeyTranslations[lowerKey]) {
    return metadataKeyTranslations[lowerKey]
  }

  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

export function formatMetadataValue(key: string, value: JsonValue): string {
  if (value === null || value === undefined) return '-'

  if (key === 'operation_type' && typeof value === 'string') {
    return formatOperationType(value)
  }

  if (key === 'status' && typeof value === 'string') {
    return formatStatus(value)
  }

  if (key === 'action' && typeof value === 'string') {
    return translateAction(value)
  }

  if (Array.isArray(value)) {
    const count = value.length
    if (count === 0) return '-'
    if (count === 1) return `[1 item]`
    return `[${count} itens]`
  }

  return formatJsonValue(value)
}
