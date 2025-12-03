'use client'

import { Card, Button } from '@/shared/ui'
import Link from 'next/link'
import {
  OperationTypeLabels,
  OperationTypeColors,
  OperationStatusLabels,
  OperationStatusColors,
} from '@/features/operations/config/operations-config'
import { ROUTES } from '@/shared/config'
import { formatDate } from '@/shared/lib/formatters'
import { OperationDisplay } from '@/features/operations'

interface OperationsTabProps {
  operations: OperationDisplay[]
}

export function OperationsTab({ operations }: OperationsTabProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-200 dark:border-gray-700 mb-6">
        Operações
      </h2>

      {operations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Horário
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {operations.map((operation) => (
                <tr key={operation.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${OperationTypeColors[operation.operation_type]}`}
                    >
                      {OperationTypeLabels[operation.operation_type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(operation.scheduled_date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-mono">
                    {operation.scheduled_time || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${OperationStatusColors[operation.status]}`}
                    >
                      {OperationStatusLabels[operation.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={ROUTES.OPERATION_DETAILS(operation.id)}>
                      <Button variant="outline" size="sm" className="text-xs">
                        Ver detalhes
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-2">Nenhuma operação gerada ainda.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Clique no botão &quot;Gerar operações&quot; acima para criar as operações baseadas no
            tipo de evento.
          </p>
        </div>
      )}
    </Card>
  )
}
