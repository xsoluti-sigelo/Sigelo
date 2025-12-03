'use client'

import { OperationTypeLabels, OperationTypeColors, OperationStatusLabels, OperationStatusColors } from '@/features/operations/config/operations-config'
import { Card } from '@/shared/ui'
import { Pagination } from '@/shared/ui/Pagination'
import { usePagination } from '@/shared/hooks'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { OperationDisplay } from '@/features/operations/model/types'
import { formatDate } from '@/shared/lib/formatters'
import { ROUTES } from '@/shared/config'

interface OperationsTableProps {
  operations: OperationDisplay[]
  currentPage: number
  totalPages: number
  search?: string
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  limit: number
  totalItems: number
}

export function OperationsTable({
  operations,
  currentPage,
  totalPages,
  search,
  selectedIds,
  onSelectionChange,
  limit,
  totalItems,
}: OperationsTableProps) {
  const router = useRouter()
  const { handlePageChange, handleItemsPerPageChange } = usePagination({ route: ROUTES.OPERATIONS })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(new Set(operations.map((op) => op.id)))
    } else {
      onSelectionChange(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    onSelectionChange(newSelected)
  }

  const isAllSelected = operations.length > 0 && selectedIds.size === operations.length

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5)
  }

  if (operations.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          {search ? `Nenhuma operação encontrada para "${search}"` : 'Nenhuma operação encontrada'}
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {selectedIds.size > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span>
            {selectedIds.size} {selectedIds.size === 1 ? 'item selecionado' : 'itens selecionados'}
          </span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white dark:bg-gray-900">
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-4 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Operação
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Evento
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Local
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Equipamentos
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Produtor
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Atribuição
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {operations.map((operation) => (
                <tr
                  key={operation.id}
                  className="hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-colors"
                >
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(operation.id)}
                      onChange={(e) => handleSelectOne(operation.id, e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                  </td>
                  <td
                    className="px-4 py-4 whitespace-nowrap text-xs text-gray-900 dark:text-gray-100 cursor-pointer"
                    onClick={() => router.push(ROUTES.OPERATION_DETAILS(operation.id))}
                  >
                    <div>{formatDate(operation.scheduled_date)}</div>
                    <div className="text-gray-500 dark:text-gray-400">
                      {formatTime(operation.scheduled_time)}
                    </div>
                  </td>
                  <td
                    className="px-4 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() => router.push(ROUTES.OPERATION_DETAILS(operation.id))}
                  >
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${OperationTypeColors[operation.operation_type]}`}
                    >
                      {OperationTypeLabels[operation.operation_type]}
                    </span>
                  </td>
                  <td
                    className="px-4 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() => router.push(ROUTES.OPERATION_DETAILS(operation.id))}
                  >
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${OperationStatusColors[operation.status]}`}
                    >
                      {OperationStatusLabels[operation.status]}
                    </span>
                  </td>
                  <td
                    className="px-4 py-4 cursor-pointer"
                    onClick={() => router.push(ROUTES.OPERATION_DETAILS(operation.id))}
                  >
                    <Link
                      href={ROUTES.EVENT_DETAILS(operation.event_id)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {operation.event_title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {operation.event_number}
                      </div>
                    </Link>
                  </td>
                  <td
                    className="px-4 py-4 text-xs text-gray-900 dark:text-gray-100 cursor-pointer"
                    onClick={() => router.push(ROUTES.OPERATION_DETAILS(operation.id))}
                  >
                    {operation.event_location || '-'}
                  </td>
                  <td
                    className="px-4 py-4 text-xs text-gray-900 dark:text-gray-100 cursor-pointer"
                    onClick={() => router.push(ROUTES.OPERATION_DETAILS(operation.id))}
                  >
                    {(operation.equipment_std || 0) > 0 && (
                      <div>
                        STD {operation.equipment_std}
                        {operation.event_source !== 'MANUAL' && operation.of_number_std && (
                          <span className="text-gray-500 dark:text-gray-400">
                            {' '} - OF: {operation.of_number_std}
                          </span>
                        )}
                      </div>
                    )}
                    {(operation.equipment_pcd || 0) > 0 && (
                      <div className="mt-0.5">
                        PCD {operation.equipment_pcd}
                        {operation.event_source !== 'MANUAL' && operation.of_number_pcd && (
                          <span className="text-gray-500 dark:text-gray-400">
                            {' '} - OF: {operation.of_number_pcd}
                          </span>
                        )}
                      </div>
                    )}
                    {(operation.equipment_std || 0) === 0 &&
                      (operation.equipment_pcd || 0) === 0 &&
                      '-'}
                  </td>
                  <td
                    className="px-4 py-4 text-xs text-gray-900 dark:text-gray-100 cursor-pointer"
                    onClick={() => router.push(ROUTES.OPERATION_DETAILS(operation.id))}
                  >
                    <div>{operation.producer_name || '-'}</div>
                    {operation.producer_phone && (
                      <div className="text-gray-500 dark:text-gray-400">
                        {operation.producer_phone}
                      </div>
                    )}
                  </td>
                  <td
                    className="px-4 py-4 text-xs text-gray-900 dark:text-gray-100 cursor-pointer"
                    onClick={() => router.push(ROUTES.OPERATION_DETAILS(operation.id))}
                  >
                    {operation.driver_name && <div>{operation.driver_name}</div>}
                    {operation.helper_name && (
                      <div>
                        <span className="font-medium">A:</span> {operation.helper_name}
                      </div>
                    )}
                    {!operation.driver_name && !operation.helper_name && '-'}
                  </td>
                </tr>
              ))}
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
