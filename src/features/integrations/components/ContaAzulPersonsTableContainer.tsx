'use client'

import { ContaAzulPersonsTable } from './ContaAzulPersonsTable'
import { useContaAzulPersonsTable } from '../hooks/useContaAzulPersonsTable'
import type { ContaAzulPessoa } from '@/features/integrations/contaazul'
import { formatPersonsForTable } from '../lib/format-persons-for-table'

interface ContaAzulPersonsTableContainerProps {
  persons: ContaAzulPessoa[]
  currentPage: number
  totalPages: number
  onRefresh?: () => void
  onSearch?: (searchTerm: string) => void
}

export function ContaAzulPersonsTableContainer({
  persons,
  currentPage,
  totalPages,
  onRefresh,
  onSearch,
}: ContaAzulPersonsTableContainerProps) {
  const { handleRefresh, handleSearch } = useContaAzulPersonsTable({
    currentPage,
    totalPages,
  })

  const handleRefreshWithCallback = () => {
    handleRefresh()
    onRefresh?.()
  }

  const handleSearchWithCallback = (searchTerm: string) => {
    handleSearch(searchTerm)
    onSearch?.(searchTerm)
  }

  const formattedPersons = formatPersonsForTable(persons)

  return (
    <div className="space-y-4">
      {/* Search and Actions Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefreshWithCallback}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Atualizar
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Buscar pessoas..."
            onChange={(e) => handleSearchWithCallback(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Presentational Table Component */}
      <ContaAzulPersonsTable
        persons={formattedPersons}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  )
}
