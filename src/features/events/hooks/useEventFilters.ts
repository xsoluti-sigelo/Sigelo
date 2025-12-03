'use client'

import { useMemo } from 'react'
import type { EventDisplay } from '../model'

export interface EventFilters {
  search: string
  status: string
  start_date: string
  end_date: string
  event_type: string
}

export function useEventFilters(events: EventDisplay[], filters: EventFilters) {
  const filteredEvents = useMemo(() => {
    let result = [...events]

    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase().trim()
      result = result.filter((event) => {
        return (
          event.client_name?.toLowerCase().includes(searchLower) ||
          event.contract_name?.toLowerCase().includes(searchLower) ||
          event.contract_number?.toLowerCase().includes(searchLower) ||
          event.id?.toLowerCase().includes(searchLower)
        )
      })
    }

    if (filters.status) {
      result = result.filter((event) => event.status === filters.status.toLowerCase())
    }

    if (filters.event_type) {
      result = result.filter((event) => event.event_type === filters.event_type)
    }

    if (filters.start_date) {
      result = result.filter((event) => event.start_date >= filters.start_date)
    }

    if (filters.end_date) {
      result = result.filter((event) => event.start_date <= filters.end_date)
    }

    return result
  }, [events, filters])

  return {
    filteredEvents,
    count: filteredEvents.length,
  }
}
