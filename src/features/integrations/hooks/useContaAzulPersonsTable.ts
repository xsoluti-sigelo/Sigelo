'use client'

import { usePagination } from '@/shared/hooks'
import { useRouter, useSearchParams } from 'next/navigation'
import { ROUTES } from '@/shared/config/constants'

interface UseContaAzulPersonsTableProps {
  currentPage: number
  totalPages: number
}

export function useContaAzulPersonsTable({
  currentPage,
  totalPages,
}: UseContaAzulPersonsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handlePageChange, handleItemsPerPageChange } = usePagination({ route: ROUTES.INTEGRATIONS_CLIENTS })

  const handleRefresh = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    router.push(`${ROUTES.INTEGRATIONS_CLIENTS}?${params.toString()}`)
  }

  const handleSearch = (searchTerm: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (searchTerm) {
      params.set('search', searchTerm)
    } else {
      params.delete('search')
    }
    params.delete('page')
    router.push(`${ROUTES.INTEGRATIONS_CLIENTS}?${params.toString()}`)
  }

  return {
    currentPage,
    totalPages,
    handlePageChange,
    handleItemsPerPageChange,
    handleRefresh,
    handleSearch,
    hasPagination: totalPages > 1,
  }
}
