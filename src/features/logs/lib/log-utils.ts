import type { ActivityLog, ActionType, LogFilters } from '../types'

export function filterLogs(logs: ActivityLog[], filters: LogFilters): ActivityLog[] {
  return logs.filter((log) => {
    if (filters.user_id && log.user_id !== filters.user_id) return false
    if (filters.action_type && log.action_type !== filters.action_type) return false
    if (filters.entity_type && log.entity_type !== filters.entity_type) return false
    if (filters.entity_id && log.entity_id !== filters.entity_id) return false
    if (filters.success !== undefined && log.success !== filters.success) return false

    if (filters.start_date) {
      const logDate = new Date(log.timestamp)
      const startDate = new Date(filters.start_date)
      if (logDate < startDate) return false
    }

    if (filters.end_date) {
      const logDate = new Date(log.timestamp)
      const endDate = new Date(filters.end_date)
      if (logDate > endDate) return false
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const searchableFields = [
        log.users?.full_name,
        log.users?.email,
        log.entity_type,
        log.action_type,
        log.ip_address,
      ]

      const matches = searchableFields.some(
        (field) => field && field.toLowerCase().includes(searchLower),
      )

      if (!matches) return false
    }

    return true
  })
}

export function sortLogsByDate(logs: ActivityLog[], ascending = false): ActivityLog[] {
  return [...logs].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime()
    const dateB = new Date(b.timestamp).getTime()
    return ascending ? dateA - dateB : dateB - dateA
  })
}

export function groupLogsByDate(logs: ActivityLog[]): Map<string, ActivityLog[]> {
  const groups = new Map<string, ActivityLog[]>()

  for (const log of logs) {
    const date = new Date(log.timestamp).toLocaleDateString('pt-BR')
    const existing = groups.get(date) || []
    groups.set(date, [...existing, log])
  }

  return groups
}

export function groupLogsByUser(logs: ActivityLog[]): Map<string, ActivityLog[]> {
  const groups = new Map<string, ActivityLog[]>()

  for (const log of logs) {
    const userId = log.user_id
    const existing = groups.get(userId) || []
    groups.set(userId, [...existing, log])
  }

  return groups
}

export function groupLogsByAction(logs: ActivityLog[]): Map<ActionType, ActivityLog[]> {
  const groups = new Map<ActionType, ActivityLog[]>()

  for (const log of logs) {
    const existing = groups.get(log.action_type) || []
    groups.set(log.action_type, [...existing, log])
  }

  return groups
}

export function getUniqueUsers(logs: ActivityLog[]): Array<{
  id: string
  name: string
  email: string
}> {
  const usersMap = new Map<string, { id: string; name: string; email: string }>()

  for (const log of logs) {
    if (!usersMap.has(log.user_id)) {
      usersMap.set(log.user_id, {
        id: log.user_id,
        name: log.users?.full_name || 'Desconhecido',
        email: log.users?.email || '',
      })
    }
  }

  return Array.from(usersMap.values())
}

export function getUniqueActionTypes(logs: ActivityLog[]): ActionType[] {
  const actionTypes = new Set<ActionType>()
  for (const log of logs) {
    actionTypes.add(log.action_type)
  }
  return Array.from(actionTypes)
}

export function getUniqueEntityTypes(logs: ActivityLog[]): string[] {
  const entityTypes = new Set<string>()
  for (const log of logs) {
    if (log.entity_type) {
      entityTypes.add(log.entity_type)
    }
  }
  return Array.from(entityTypes)
}

export function calculateSuccessRate(logs: ActivityLog[]): number {
  if (logs.length === 0) return 0
  const successCount = logs.filter((log) => log.success).length
  return (successCount / logs.length) * 100
}

export function getLogsByDateRange(
  logs: ActivityLog[],
  startDate: Date,
  endDate: Date,
): ActivityLog[] {
  return logs.filter((log) => {
    const logDate = new Date(log.timestamp)
    return logDate >= startDate && logDate <= endDate
  })
}
