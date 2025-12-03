'use client'

import { DataTable, DataTableColumn } from '@/shared/ui/DataTable'
import { Pagination } from '@/shared/ui/Pagination'
import { useContaAzulPersonsTable } from '../hooks/useContaAzulPersonsTable'
import type { FormattedPerson } from '../lib/format-persons-for-table'

interface ContaAzulPersonsTableProps {
  persons: FormattedPerson[]
  currentPage: number
  totalPages: number
  totalItems?: number
  itemsPerPage?: number
}

export function ContaAzulPersonsTable({
  persons,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
}: ContaAzulPersonsTableProps) {
  const { handlePageChange, handleItemsPerPageChange, hasPagination } = useContaAzulPersonsTable({
    currentPage,
    totalPages,
  })

  const columns: DataTableColumn<FormattedPerson>[] = [
    {
      header: 'Nome',
      accessor: (row) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">{row.displayName}</div>
          {row.email && <div className="text-xs text-gray-500 dark:text-gray-400">{row.email}</div>}
        </div>
      ),
    },
    {
      header: 'Documento',
      accessor: (row) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">{row.document}</div>
      ),
    },
    {
      header: 'Tipo',
      accessor: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          {row.personType}
        </span>
      ),
    },
    {
      header: 'Perfis',
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.profileBadges.map((badge, index) => (
            <span
              key={`${badge.label}-${index}`}
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}
            >
              {badge.label}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Contato',
      accessor: (row) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">{row.contact}</div>
      ),
    },
    {
      header: 'Cidade',
      accessor: (row) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">{row.location}</div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.active
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
          }`}
        >
          {row.active ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
  ]

  return (
    <DataTable
      data={persons}
      columns={columns}
      emptyState={{
        title: 'Nenhuma pessoa sincronizada',
        description: 'Clique em "Sincronizar Pessoas" para buscar do Conta Azul',
      }}
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
