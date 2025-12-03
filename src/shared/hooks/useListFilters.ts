'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

interface UseListFiltersOptions<T extends Record<string, string>> {
  initialFilters: T
  basePath: string
}

export function useListFilters<T extends Record<string, string>>({
  initialFilters,
  basePath,
}: UseListFiltersOptions<T>) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [filters, setFilters] = useState<T>(() => {
    const result = { ...initialFilters } as T
    Object.keys(initialFilters).forEach((key) => {
      const value = searchParams.get(key)
      if (value) {
        result[key as keyof T] = value as T[keyof T]
      }
    })
    return result
  })

  const handleFilterChange = (key: keyof T, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const applyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    startTransition(() => {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value as string)
        }
      })

      params.set('page', '1')
      const newUrl = `${basePath}?${params.toString()}`
      router.push(newUrl)
    })
  }

  const clearFilters = () => {
    setFilters(initialFilters)
    startTransition(() => {
      router.push(basePath)
    })
  }

  const activeFiltersCount = Object.values(filters).filter((v) => v !== '').length
  const hasActiveFilters = activeFiltersCount > 0

  return {
    filters,
    setFilters,
    handleFilterChange,
    applyFilters,
    clearFilters,
    activeFiltersCount,
    hasActiveFilters,
    isPending,
  }
}
