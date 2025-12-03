'use client'

import { ReactNode } from 'react'
import { Card } from '@/shared/ui/Card'
import Link from 'next/link'

export interface DataTableColumn<T> {
  header: string
  accessor: keyof T | ((row: T) => ReactNode)
  className?: string
  headerClassName?: string
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  onRowClick?: (row: T) => void
  emptyState?: {
    title: string
    description?: string
    action?: ReactNode
  }
  searchQuery?: string
  clearFiltersUrl?: string
  pagination?: ReactNode
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  emptyState,
  searchQuery,
  clearFiltersUrl,
  pagination,
}: DataTableProps<T>) {
  const getCellValue = (row: T, column: DataTableColumn<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row)
    }
    return row[column.accessor] as ReactNode
  }

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center'
      case 'right':
        return 'text-right'
      default:
        return 'text-left'
    }
  }

  if (data.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery
              ? `Nenhum resultado encontrado com os filtros aplicados.`
              : emptyState?.description || 'Nenhum item cadastrado ainda.'}
          </p>
          {searchQuery && clearFiltersUrl && (
            <Link
              href={clearFiltersUrl}
              className="text-teal-600 dark:text-teal-400 hover:underline mt-2 inline-block"
            >
              Limpar filtros
            </Link>
          )}
          {!searchQuery && emptyState?.action && <div className="mt-4">{emptyState.action}</div>}
        </div>
      </Card>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider ${getAlignClass(column.align)} ${column.headerClassName || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.map((row) => (
              <tr
                key={row.id}
                className={`hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-colors group ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column, columnIndex) => (
                  <td
                    key={columnIndex}
                    className={`px-6 py-4 ${getAlignClass(column.align)} ${column.className || ''}`}
                  >
                    {getCellValue(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4">
          {pagination}
        </div>
      )}
    </div>
  )
}
