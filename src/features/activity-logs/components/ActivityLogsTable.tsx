'use client'

import type { ActivityLog } from '@/features/activity-logs'
import {
  formatTimestamp,
  getActionTypeLabel,
  getActionTypeColor,
  formatIpAddress,
  getFieldChanges,
  formatFieldName,
  formatJsonValue,
  formatEntityType,
  formatStatus,
  formatMetadataValue,
  translateMetadataKey,
} from '@/features/activity-logs'
import { Card } from '@/shared/ui'
import { Pagination } from '@/shared/ui/Pagination'
import { usePagination } from '@/shared/hooks'
import { ROUTES } from '@/shared/config'

interface ActivityLogsTableProps {
  logs: ActivityLog[]
  currentPage: number
  totalPages: number
  limit: number
  totalItems: number
}

export function ActivityLogsTable({ logs, currentPage, totalPages, limit, totalItems }: ActivityLogsTableProps) {
  const { handlePageChange, handleItemsPerPageChange } = usePagination({ route: ROUTES.AUDIT })
  if (logs.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">Nenhum log de auditoria encontrado</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Quando
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Ação
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Detalhes
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  IP
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {logs.map((log) => {
                const time = formatTimestamp(log.timestamp)
                const colorClass = getActionTypeColor(log.action_type)
                const changes = getFieldChanges(log.old_value, log.new_value)

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {time.relative}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {time.absolute}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {log.users?.full_name || 'Desconhecido'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {log.users?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}
                      >
                        {getActionTypeLabel(log.action_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {log.entity_type && (
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {formatEntityType(log.entity_type)}
                        </div>
                      )}

                      {changes.length > 0 && (
                        <div className="text-xs space-y-1 mt-1">
                          {changes.slice(0, 3).map((change) => {
                            const oldVal =
                              change.field === 'status'
                                ? formatStatus(String(change.oldValue))
                                : formatJsonValue(change.oldValue)
                            const newVal =
                              change.field === 'status'
                                ? formatStatus(String(change.newValue))
                                : formatJsonValue(change.newValue)

                            return (
                              <div key={change.field} className="text-gray-600 dark:text-gray-400">
                                <span className="font-medium">
                                  {formatFieldName(change.field)}:
                                </span>{' '}
                                <span className="text-red-600 dark:text-red-400 line-through">
                                  {oldVal}
                                </span>
                                {' → '}
                                <span className="text-green-600 dark:text-green-400">{newVal}</span>
                              </div>
                            )
                          })}
                          {changes.length > 3 && (
                            <div className="text-gray-500 dark:text-gray-400 italic">
                              +{changes.length - 3} alterações adicionais
                            </div>
                          )}
                        </div>
                      )}

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          {Object.entries(log.metadata)
                            .filter(([key]) => key !== 'fields_changed')
                            .slice(0, 3)
                            .map(([key, value]) => (
                              <div key={key} className="mb-1">
                                <span className="font-medium">{translateMetadataKey(key)}:</span>{' '}
                                {formatMetadataValue(key, value)}
                              </div>
                            ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {formatIpAddress(log.ip_address)}
                      </div>
                      {!log.success && log.error_message && (
                        <div className="text-xs text-red-500 dark:text-red-400 mt-1">
                          {log.error_message}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={limit}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      </div>
    </div>
  )
}
