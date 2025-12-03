'use client'

import type { ActivityLog } from '../types'
import {
  formatTimestamp,
  getActionTypeLabel,
  getActionTypeColor,
  formatIpAddress,
  formatUserAgent,
  getFieldChanges,
  formatFieldName,
  formatJsonValue,
} from '../lib'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface LogDetailsProps {
  log: ActivityLog
  onClose?: () => void
}

export function LogDetails({ log, onClose }: LogDetailsProps) {
  const time = formatTimestamp(log.timestamp)
  const colorClass = getActionTypeColor(log.action_type)
  const changes = getFieldChanges(log.old_value, log.new_value)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${colorClass}`}
            >
              {getActionTypeLabel(log.action_type)}
            </span>
            {!log.success && (
              <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                Falha
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{time.absolute}</p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Usuário</h3>
          <div className="text-sm text-gray-900 dark:text-gray-100">
            {log.users?.full_name || 'Desconhecido'}
          </div>
          {log.users?.email && (
            <div className="text-sm text-gray-500 dark:text-gray-400">{log.users.email}</div>
          )}
        </div>

        {log.entity_type && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Entidade
            </h3>
            <div className="text-sm text-gray-900 dark:text-gray-100">{log.entity_type}</div>
            {log.entity_id && (
              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                ID: {log.entity_id}
              </div>
            )}
          </div>
        )}

        {changes.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Alterações
            </h3>
            <div className="space-y-2">
              {changes.map((change) => (
                <div
                  key={change.field}
                  className="text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {formatFieldName(change.field)}
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-red-600 dark:text-red-400 line-through">
                      {formatJsonValue(change.oldValue)}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="text-green-600 dark:text-green-400">
                      {formatJsonValue(change.newValue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {log.error_message && (
          <div>
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
              Mensagem de Erro
            </h3>
            <div className="text-sm text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {log.error_message}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Informações Técnicas
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">IP:</span>
              <span className="text-gray-900 dark:text-gray-100 font-mono">
                {formatIpAddress(log.ip_address)}
              </span>
            </div>
            {log.user_agent && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">User Agent:</span>
                <span className="text-gray-900 dark:text-gray-100 text-xs">
                  {formatUserAgent(log.user_agent)}
                </span>
              </div>
            )}
            {log.page_url && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">URL:</span>
                <span className="text-gray-900 dark:text-gray-100 text-xs truncate max-w-xs">
                  {log.page_url}
                </span>
              </div>
            )}
          </div>
        </div>

        {log.metadata && Object.keys(log.metadata).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Metadados
            </h3>
            <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded-lg overflow-auto">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
