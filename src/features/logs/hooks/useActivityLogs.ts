'use client'

import { useState, useCallback } from 'react'
import type { ActivityLog, LogFilters } from '../types'
import { LogFilterService } from '../services'

interface UseActivityLogsProps {
  initialLogs?: ActivityLog[]
  initialFilters?: LogFilters
}

export function useActivityLogs(props?: UseActivityLogsProps) {
  const { initialLogs = [], initialFilters = {} } = props ?? {}

  const [logs, setLogs] = useState<ActivityLog[]>(initialLogs)
  const [filters, setFilters] = useState<LogFilters>(initialFilters)
  const [isLoading, setIsLoading] = useState(false)

  const filterService = new LogFilterService(logs)

  const filteredLogs = filterService.applyFilters(filters)
  const totalCount = filterService.getFilteredCount(filters)
  const totalPages = filterService.getTotalPages(filters)

  const updateFilters = useCallback((newFilters: Partial<LogFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }, [])

  const refreshLogs = useCallback(async (fetchFn: () => Promise<ActivityLog[]>) => {
    setIsLoading(true)
    try {
      const newLogs = await fetchFn()
      setLogs(newLogs)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    logs: filteredLogs,
    allLogs: logs,
    filters,
    totalCount,
    totalPages,
    currentPage: filters.page || 1,
    isLoading,
    updateFilters,
    clearFilters,
    setPage,
    refreshLogs,
    hasFilters: Object.keys(filters).length > 0,
  }
}
