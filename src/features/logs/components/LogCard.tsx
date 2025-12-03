'use client'

import type { ActivityLog } from '../types'
import {
  formatTimestamp,
  getActionTypeLabel,
  getActionTypeColor,
  truncateEntityId,
  formatIpAddress,
} from '../lib'

interface LogCardProps {
  log: ActivityLog
  onClick?: (log: ActivityLog) => void
  showUser?: boolean
  compact?: boolean
}

export function LogCard({ log, onClick, showUser = true, compact = false }: LogCardProps) {
  const time = formatTimestamp(log.timestamp)
  const colorClass = getActionTypeColor(log.action_type)

  return (
    <div
      className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
      onClick={() => onClick?.(log)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}
            >
              {getActionTypeLabel(log.action_type)}
            </span>

            {!log.success && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                Erro
              </span>
            )}
          </div>

          {showUser && (
            <div className="text-sm text-gray-900 dark:text-gray-100 font-medium mb-1">
              {log.users?.full_name || 'Desconhecido'}
            </div>
          )}

          {log.entity_type && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {log.entity_type}
              {log.entity_id && (
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                  ({truncateEntityId(log.entity_id)})
                </span>
              )}
            </div>
          )}

          {!compact && log.error_message && (
            <div className="text-xs text-red-500 dark:text-red-400 mt-2">{log.error_message}</div>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span title={time.absolute}>{time.relative}</span>
            <span>•</span>
            <span>{formatIpAddress(log.ip_address)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
