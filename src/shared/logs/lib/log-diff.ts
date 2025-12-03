import type { JsonValue } from '../types'

export interface FieldChange {
  field: string
  oldValue: JsonValue
  newValue: JsonValue
  changed: boolean
}

export function getFieldChanges(
  oldValue: Record<string, JsonValue> | null,
  newValue: Record<string, JsonValue> | null,
): FieldChange[] {
  if (!oldValue || !newValue) return []

  const changes: FieldChange[] = []
  const allKeys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)])

  for (const key of allKeys) {
    const old = oldValue[key]
    const current = newValue[key]
    const changed = JSON.stringify(old) !== JSON.stringify(current)

    changes.push({
      field: key,
      oldValue: old,
      newValue: current,
      changed,
    })
  }

  return changes.filter((change) => change.changed)
}

export function hasChanges(
  oldValue: Record<string, JsonValue> | null,
  newValue: Record<string, JsonValue> | null,
): boolean {
  return getFieldChanges(oldValue, newValue).length > 0
}

export function getChangeCount(
  oldValue: Record<string, JsonValue> | null,
  newValue: Record<string, JsonValue> | null,
): number {
  return getFieldChanges(oldValue, newValue).length
}

export function isValueAdded(change: FieldChange): boolean {
  return change.oldValue === null || change.oldValue === undefined
}

export function isValueRemoved(change: FieldChange): boolean {
  return change.newValue === null || change.newValue === undefined
}

export function isValueModified(change: FieldChange): boolean {
  return !isValueAdded(change) && !isValueRemoved(change)
}

const fieldNameTranslations: Record<string, string> = {
  status: 'Status',
  type: 'Tipo',
  date: 'Data',
  time: 'Hora',
  notes: 'Observações',
  description: 'Descrição',
  created_at: 'Criado em',
  updated_at: 'Atualizado em',
  operation_number: 'Número da Operação',
  operation_id: 'ID da Operação',
  operation_type: 'Tipo de Operação',
  fields_changed: 'Campos Alterados',
  driver_id: 'Motorista',
  vehicle_id: 'Veículo',
  event_id: 'ID do Evento',
  event_number: 'Número do Evento',
  event_name: 'Nome do Evento',
  source: 'Origem',
  user_id: 'Usuário',
  full_name: 'Nome Completo',
  email: 'Email',
  role: 'Perfil',
  client_id: 'Cliente',
  client_name: 'Nome do Cliente',
  tenant_id: 'Inquilino',
  metadata: 'Metadados',
  ip_address: 'Endereço IP',
  user_agent: 'Navegador',
  success: 'Sucesso',
  error_message: 'Mensagem de Erro',
}

export function formatFieldName(field: string): string {
  if (fieldNameTranslations[field]) {
    return fieldNameTranslations[field]
  }

  return field
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}
