'use client'

import type { EventDisplay } from '@/features/events'
import { EventsHeader, EventList } from '@/features/events'
import { useSearchParams } from 'next/navigation'

interface EventsPageClientProps {
  allEvents: EventDisplay[]
}

export function EventsPageClient({ allEvents }: EventsPageClientProps) {
  const searchParams = useSearchParams()

  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const start_date = searchParams.get('start_date') || ''
  const end_date = searchParams.get('end_date') || ''
  const event_type = searchParams.get('event_type') || ''

  const filters = {
    search,
    status,
    start_date,
    end_date,
    event_type,
  }

  return (
    <>
      <EventsHeader count={allEvents.length} />
      <EventList events={allEvents} filters={filters} currentPage={page} pageSize={limit} />
    </>
  )
}
