'use client'

import { Employee } from '@/features/employee'
import { ListPageHeader } from '@/shared/ui/patterns/ListPageHeader'
import { DataTable, DataTableColumn } from '@/shared/ui/DataTable'
import { Pagination } from '@/shared/ui/Pagination'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { usePagination } from '@/shared/hooks'
import { ROUTES } from '@/shared/config'

interface EmployeeListWidgetProps {
  employees: Employee[]
  currentPage: number
  totalPages: number
  count: number
  search?: string
  itemsPerPage?: number
}

export function EmployeeListWidget({
  employees,
  currentPage,
  totalPages,
  count,
  search,
  itemsPerPage = 10,
}: EmployeeListWidgetProps) {
  const { handlePageChange, handleItemsPerPageChange } = usePagination({ route: ROUTES.EMPLOYEES })

  const columns: DataTableColumn<Employee>[] = [
    {
      header: 'Nome',
      accessor: (row) => (
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
          {row.display_name}
        </div>
      ),
    },
    {
      header: 'Matrícula',
      accessor: (row) => (
        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
          {row.employee_number || '-'}
        </div>
      ),
    },
    {
      header: 'Motorista',
      align: 'center',
      accessor: (row) => (
        <div className="flex justify-center">
          {row.is_driver ? (
            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <XCircleIcon className="w-5 h-5 text-gray-300 dark:text-gray-600" />
          )}
        </div>
      ),
    },
    {
      header: 'Ajudante',
      align: 'center',
      accessor: (row) => (
        <div className="flex justify-center">
          {row.is_helper ? (
            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <XCircleIcon className="w-5 h-5 text-gray-300 dark:text-gray-600" />
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <ListPageHeader
        config={{
          title: 'Funcionários',
          singularLabel: 'funcionário cadastrado',
          pluralLabel: 'funcionários cadastrados',
          count,
          basePath: ROUTES.EMPLOYEES,
          searchPlaceholder: 'Buscar por nome, CPF ou matrícula...',
          showCreateButton: false,
        }}
      />

      <DataTable
        data={employees}
        columns={columns}
        searchQuery={search}
        clearFiltersUrl={ROUTES.EMPLOYEES}
        pagination={
          count ? (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={count}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          ) : undefined
        }
      />
    </div>
  )
}
