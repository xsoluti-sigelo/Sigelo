'use client'

import { useMemo } from 'react'
import type { ActivityLog } from '../types'
import { LogStatsService } from '../services'

export function useLogStats(logs: ActivityLog[]) {
  const stats = useMemo(() => {
    const service = new LogStatsService(logs)
    return service.getStats()
  }, [logs])

  const errorLogs = useMemo(() => {
    const service = new LogStatsService(logs)
    return service.getErrorLogs()
  }, [logs])

  const errorRate = useMemo(() => {
    const service = new LogStatsService(logs)
    return service.getErrorRate()
  }, [logs])

  const mostActiveDay = useMemo(() => {
    const service = new LogStatsService(logs)
    return service.getMostActiveDay()
  }, [logs])

  const mostActiveHour = useMemo(() => {
    const service = new LogStatsService(logs)
    return service.getMostActiveHour()
  }, [logs])

  return {
    stats,
    errorLogs,
    errorRate,
    mostActiveDay,
    mostActiveHour,
  }
}
