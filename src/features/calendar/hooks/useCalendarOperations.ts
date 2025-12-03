'use client'

import { useState, useEffect, useCallback } from 'react'
import { getCalendarOperations } from '../actions'
import { CalendarService } from '../services/calendar.service'
import { logger } from '@/shared/lib/logger'
import type { CalendarEvent } from '../model/types'

interface UseCalendarOperationsResult {
  events: CalendarEvent[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useCalendarOperations(currentDate: Date): UseCalendarOperationsResult {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchOperations = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const range = CalendarService.getDateRange(currentDate)
      const { startDate, endDate } = CalendarService.formatDateRange(range)

      const data = await getCalendarOperations(startDate, endDate)
      setEvents(data)
    } catch (err) {
      const error = err as Error
      logger.error('Error fetching calendar operations', error)
      setError(error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [currentDate])

  useEffect(() => {
    fetchOperations()
  }, [fetchOperations])

  return {
    events,
    loading,
    error,
    refetch: fetchOperations,
  }
}
