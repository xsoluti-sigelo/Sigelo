'use client'

import type { ActivityLog } from '../types'
import { LogCard } from './LogCard'

interface LogListProps {
  logs: ActivityLog[]
  onLogClick?: (log: ActivityLog) => void
  showUser?: boolean
  compact?: boolean
  emptyMessage?: string
}

export function LogList({
  logs,
  onLogClick,
  showUser = true,
  compact = false,
  emptyMessage = 'Nenhum log encontrado',
}: LogListProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <LogCard
          key={log.id}
          log={log}
          onClick={onLogClick}
          showUser={showUser}
          compact={compact}
        />
      ))}
    </div>
  )
}
