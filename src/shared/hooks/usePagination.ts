'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface UsePaginationOptions {
  route: string
}

export function usePagination({ route }: UsePaginationOptions) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`${route}?${params.toString()}`)
  }

  const handleItemsPerPageChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('limit', newLimit.toString())
    params.set('page', '1')
    router.push(`${route}?${params.toString()}`)
  }

  return {
    handlePageChange,
    handleItemsPerPageChange,
  }
}
