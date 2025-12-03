'use client'

import type { EventDisplay } from '../model'
import { DataTable, DataTableColumn } from '@/shared/ui/DataTable'
import { Pagination } from '@/shared/ui/Pagination'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatDate } from '@/shared/lib/formatters'
import { ROUTES } from '@/shared/config'
import { getEventTypeLabel, getEventTypeColor, getEventStatusLabel, getStatusColor } from '../lib/enum-mappers'

interface EventsTableProps {
  events: EventDisplay[]
  currentPage: number
  totalPages: number
  search?: string
  totalItems?: number
  itemsPerPage?: number
}

export function EventsTable({ events, currentPage, totalPages, search, totalItems, itemsPerPage }: EventsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`${ROUTES.EVENTS}?${params.toString()}`)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('limit', newItemsPerPage.toString())
    params.set('page', '1')
    router.push(`${ROUTES.EVENTS}?${params.toString()}`)
  }

  const columns: DataTableColumn<EventDisplay>[] = [
    {
      header: 'Cliente',
      className: 'min-w-[180px]',
      accessor: (row) => (
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
          {row.client_name}
        </div>
      ),
    },
    {
      header: 'Contrato',
      className: 'min-w-[200px]',
      accessor: (row) => (
        <div>
          <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
            {row.contract_name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            {row.contract_number}
          </div>
        </div>
      ),
    },
    {
      header: 'Tipo',
      className: 'min-w-[120px]',
      accessor: (row) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getEventTypeColor(row.event_type)}`}
        >
          {getEventTypeLabel(row.event_type)}
        </span>
      ),
    },
    {
      header: 'Status',
      className: 'min-w-[120px] text-center',
      accessor: (row) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}
        >
          {getEventStatusLabel(row.status)}
        </span>
      ),
    },
    {
      header: 'Período',
      className: 'min-w-[160px]',
      accessor: (row) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {formatDate(row.start_date)}
          {row.end_date && (
            <>
              <br />
              <span className="text-gray-500 dark:text-gray-400">
                até {formatDate(row.end_date)}
              </span>
            </>
          )}
        </div>
      ),
    },
    {
      header: 'Data de recebimento',
      className: 'min-w-[160px]',
      accessor: (row) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {row.received_at ? formatDate(row.received_at) : '-'}
        </div>
      ),
    },
  ]

  return (
    <DataTable
      data={events}
      columns={columns}
      onRowClick={(event) => router.push(ROUTES.EVENT_DETAILS(event.id))}
      searchQuery={search}
      emptyState={{
        title: search ? `Nenhum evento encontrado para "${search}"` : 'Nenhum evento encontrado',
      }}
      pagination={
        totalItems ? (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        ) : undefined
      }
    />
  )
}
