'use client'

import { usePagination } from '@/shared/hooks'
import { ROUTES } from '@/shared/config/constants'

interface UseContaAzulServicesTableProps {
  currentPage?: number
  totalPages?: number
}

export function useContaAzulServicesTable({
  currentPage = 1,
  totalPages = 1,
}: UseContaAzulServicesTableProps = {}) {
  const { handlePageChange, handleItemsPerPageChange } = usePagination({ route: ROUTES.INTEGRATIONS_SERVICES })

  return {
    currentPage,
    totalPages,
    hasPagination: (totalPages ?? 0) > 1,
    handlePageChange,
    handleItemsPerPageChange,
  }
}
