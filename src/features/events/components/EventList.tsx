'use client'

import type { EventDisplay } from '../model'
import { EventsTable } from './EventsTable'
import { useEventFilters, EventFilters } from '../hooks'
import { useMemo } from 'react'

interface EventListProps {
  events: EventDisplay[]
  filters: EventFilters
  currentPage: number
  pageSize: number
}

export function EventList({ events, filters, currentPage, pageSize }: EventListProps) {
  const { filteredEvents, count } = useEventFilters(events, filters)

  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredEvents.slice(startIndex, endIndex)
  }, [filteredEvents, currentPage, pageSize])

  const totalPages = Math.ceil(count / pageSize)

  return (
    <EventsTable
      events={paginatedEvents}
      currentPage={currentPage}
      totalPages={totalPages}
      search={filters.search}
      totalItems={count}
      itemsPerPage={pageSize}
    />
  )
}
