import type { IssueType, IssueSeverity } from '../types'

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  missing_event_id: 'ID do evento ausente',
  missing_start_date: 'Data de início ausente',
  incomplete_address: 'Endereço incompleto',
  invalid_time: 'Horário inválido',
  no_items: 'Sem itens',
  geocoding_failed: 'Falha na geocodificação',
  time_conflict: 'Conflito de horário',
  time_inconsistent: 'Horário inconsistente',
  missing_assignment: 'Alocação ausente',
}

export const SEVERITY_LABELS: Record<IssueSeverity, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
}

export const SEVERITY_COLORS: Record<IssueSeverity, { bg: string; text: string; border: string }> = {
  LOW: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  MEDIUM: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    text: 'text-yellow-800 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  HIGH: {
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    text: 'text-orange-800 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800',
  },
  CRITICAL: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
  },
}
