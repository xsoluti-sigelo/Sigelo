'use client'

import { Card } from '@/shared/ui'
import { DataTable, DataTableColumn } from '@/shared/ui/DataTable'
import { Pagination } from '@/shared/ui/Pagination'
import { useContaAzulServicesTable } from '../hooks/useContaAzulServicesTable'
import type { FormattedService } from '../lib/format-services-for-table'

interface ServicesTableProps {
  services: FormattedService[]
  currentPage: number
  totalPages: number
  totalItems?: number
  itemsPerPage?: number
}

export function ServicesTable({ services, currentPage, totalPages, totalItems, itemsPerPage }: ServicesTableProps) {
  const { handlePageChange, handleItemsPerPageChange, hasPagination } = useContaAzulServicesTable({
    currentPage,
    totalPages,
  })

  const columns: DataTableColumn<FormattedService>[] = [
    {
      header: 'Nome do serviço',
      accessor: (row) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.name}</div>
      ),
    },
    {
      header: 'Custo',
      align: 'right',
      accessor: (row) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">{row.costRate}</div>
      ),
    },
    {
      header: 'Preço de venda',
      align: 'right',
      accessor: (row) => (
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{row.rate}</div>
      ),
    },
    {
      header: 'Margem',
      align: 'right',
      accessor: (row) => (
        <div className={`text-sm font-medium ${row.margin.colorClass}`}>{row.margin.label}</div>
      ),
    },
    {
      header: 'Sincronizado em',
      accessor: (row) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">{row.syncedAt}</div>
      ),
    },
  ]

  if (services.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhum serviço encontrado</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Clique em &quot;Sincronizar Serviços&quot; para importar serviços do Conta Azul
        </p>
      </Card>
    )
  }

  return (
    <DataTable
      data={services}
      columns={columns}
      pagination={
        hasPagination && totalItems ? (
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
