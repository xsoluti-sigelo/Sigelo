'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  itemsPerPage?: number
  onItemsPerPageChange?: (itemsPerPage: number) => void
  itemsPerPageOptions?: number[]
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 50, 100]
}: PaginationProps) {
  if (totalPages <= 1 && !onItemsPerPageChange) {
    return null
  }

  const getItemRange = () => {
    if (!totalItems || !itemsPerPage) return null
    const start = (currentPage - 1) * itemsPerPage + 1
    const end = Math.min(currentPage * itemsPerPage, totalItems)
    return { start, end }
  }

  const itemRange = getItemRange()

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {itemRange && totalItems ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando <span className="font-medium text-gray-900 dark:text-gray-100">{itemRange.start}</span> a{' '}
            <span className="font-medium text-gray-900 dark:text-gray-100">{itemRange.end}</span> de{' '}
            <span className="font-medium text-gray-900 dark:text-gray-100">{totalItems}</span> itens
          </p>
        ) : null}

        {onItemsPerPageChange && itemsPerPage && (
          <div className="flex items-center gap-2">
            <label htmlFor="items-per-page" className="text-sm text-gray-600 dark:text-gray-400">
              Por página:
            </label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            disabled={page === '...'}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            className={`min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : page === '...'
                  ? 'cursor-default text-gray-400 dark:text-gray-600'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  )
}
