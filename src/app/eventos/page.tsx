import { Breadcrumb } from '@/shared/ui'
import { getEvents } from '@/features/events/api'
import { EventsPageClient } from './EventsPageClient'

export default async function EventosPage() {
  const { data: allEvents } = await getEvents({
    page: 1,
    limit: 1000,
  })

  return (
    <div className="p-8 w-full">
      <div className="max-w-[1600px] mx-auto">
        <Breadcrumb items={[{ label: 'Eventos' }]} className="mb-6" />
        <EventsPageClient allEvents={allEvents} />
      </div>
    </div>
  )
}
