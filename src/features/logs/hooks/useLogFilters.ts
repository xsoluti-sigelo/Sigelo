'use client'

import { useState, useCallback, useMemo } from 'react'
import type { ActionType, LogFilters } from '../types'

export function useLogFilters(initialFilters: LogFilters = {}) {
  const [filters, setFilters] = useState<LogFilters>(initialFilters)

  const setActionType = useCallback((action_type?: ActionType) => {
    setFilters((prev) => ({ ...prev, action_type, page: 1 }))
  }, [])

  const setUserId = useCallback((user_id?: string) => {
    setFilters((prev) => ({ ...prev, user_id, page: 1 }))
  }, [])

  const setEntityType = useCallback((entity_type?: string) => {
    setFilters((prev) => ({ ...prev, entity_type, page: 1 }))
  }, [])

  const setEntityId = useCallback((entity_id?: string) => {
    setFilters((prev) => ({ ...prev, entity_id, page: 1 }))
  }, [])

  const setDateRange = useCallback((start_date?: string, end_date?: string) => {
    setFilters((prev) => ({ ...prev, start_date, end_date, page: 1 }))
  }, [])

  const setSuccess = useCallback((success?: boolean) => {
    setFilters((prev) => ({ ...prev, success, page: 1 }))
  }, [])

  const setSearch = useCallback((search?: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }))
  }, [])

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }, [])

  const setLimit = useCallback((limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({ page: 1, limit: filters.limit || 50 })
  }, [filters.limit])

  const clearFilter = useCallback((key: keyof LogFilters) => {
    setFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }, [])

  const hasActiveFilters = useMemo(() => {
    const otherFilters = { ...filters }
    delete otherFilters.page
    delete otherFilters.limit
    return Object.keys(otherFilters).length > 0
  }, [filters])

  const activeFilterCount = useMemo(() => {
    const otherFilters = { ...filters }
    delete otherFilters.page
    delete otherFilters.limit
    return Object.keys(otherFilters).filter(
      (key) => otherFilters[key as keyof typeof otherFilters] !== undefined,
    ).length
  }, [filters])

  return {
    filters,
    setFilters,
    setActionType,
    setUserId,
    setEntityType,
    setEntityId,
    setDateRange,
    setSuccess,
    setSearch,
    setPage,
    setLimit,
    clearFilters,
    clearFilter,
    hasActiveFilters,
    activeFilterCount,
  }
}
