'use client'

import { useCallback } from 'react'
import { getDashboardStats } from '../actions'
import type { DashboardStats } from '@/entities/dashboard'

export function useDashboardStats() {
  const fetchStats = useCallback(async (): Promise<DashboardStats> => {
    return getDashboardStats()
  }, [])

  return {
    fetchStats,
  }
}
