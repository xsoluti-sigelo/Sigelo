import { Breadcrumb } from '@/shared/ui'
import { createClient } from '@/shared/lib/supabase/server'
import { EventFormWidget } from '@/widgets/event'
import { notFound, redirect } from 'next/navigation'
import { hasWritePermission } from '@/entities/user'
import { getEventForEdit } from '@/features/events/api'
import type { Metadata } from 'next'
import { ROUTES } from '@/shared/config'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('new_events')
    .select('name, number, year')
    .eq('id', id)
    .single()

  const eventName = event?.name || 'Evento'

  return {
    title: `Editar evento ${eventName} - Eventos - Sigelo`,
    description: `Atualizar informações do evento ${eventName}`,
  }
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(ROUTES.LOGIN)
  }

  const eventData = await getEventForEdit(id)

  if (!eventData) {
    notFound()
  }

  const {
    event,
    people,
    orders,
    eventServices,
    itemServices,
    customEventServices,
    locationData,
    attachments,
    userRole,
  } = eventData

  if (!hasWritePermission(userRole)) {
    redirect(ROUTES.EVENTS)
  }

  const eventWithDates = event as typeof event & {
    start_date?: string | null
    end_date?: string | null
    event_type?: 'UNICO' | 'INTERMITENTE' | 'CONTINUO' | null
    cleaning_rule?: {
      type: 'daily' | 'weekly'
      daysOfWeek?: ('DOM' | 'SEG' | 'TER' | 'QUA' | 'QUI' | 'SEX' | 'SAB')[]
      time: string
    } | null
    mobilization_datetime?: string | null
    demobilization_datetime?: string | null
    pre_cleaning_datetime?: string | null
    post_cleaning_datetime?: string | null
  }

  const initialData = {
    name: event.name || '',
    number: event.number || '',
    year: event.year || new Date().getFullYear(),
    date: event.date || '',
    start_date: eventWithDates.start_date || event.date || '',
    end_date: eventWithDates.end_date || event.date || '',
    start_time: event.start_time || '00:00:00',
    end_time: event.end_time || '00:00:00',
    location: event.location || '',
    contract: event.contract,
    status: event.status || 'DRAFT',
    client_id: event.new_events_contaazul_pessoas?.[0]?.pessoa_id,
    received_date: event.received_date,
    is_night_event: event.is_night_event,
    is_intermittent: event.is_intermittent,
    event_type: eventWithDates.event_type || null,
    cleaning_rule: eventWithDates.cleaning_rule || null,
    mobilization_datetime: eventWithDates.mobilization_datetime
      ? new Date(eventWithDates.mobilization_datetime).toISOString().slice(0, 16)
      : '',
    demobilization_datetime: eventWithDates.demobilization_datetime
      ? new Date(eventWithDates.demobilization_datetime).toISOString().slice(0, 16)
      : '',
    pre_cleaning_datetime: eventWithDates.pre_cleaning_datetime
      ? new Date(eventWithDates.pre_cleaning_datetime).toISOString().slice(0, 16)
      : '',
    post_cleaning_datetime: eventWithDates.post_cleaning_datetime
      ? new Date(eventWithDates.post_cleaning_datetime).toISOString().slice(0, 16)
      : '',
    source: event.source || null,
    services: eventServices.map((s) => s.service_id),
    eventServices: customEventServices.map(
      (s: {
        id: string
        contaazul_service_id: string
        quantity: number
        unit_price: number
        daily_rate: number
        total_price: number
        notes: string | null
      }) => ({
        id: s.id,
        contaazul_service_id: s.contaazul_service_id,
        quantity: s.quantity,
        unit_price: s.unit_price,
        daily_rate: s.daily_rate,
        total_price: s.total_price,
        notes: s.notes || undefined,
        order_id: undefined,
      }),
    ),
    people: people.map((p) => ({
      id: p.id,
      name: p.name || '',
      role: p.role as 'producer' | 'coordinator',
      phone: p.phone,
      is_primary: p.is_primary || false,
    })),
    orders: orders.map((o) => ({
      id: o.id,
      number: o.number || '',
      date: o.date || event.date || '',
      total_value: o.total_value || 0,
      is_cancelled: o.is_cancelled || false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: (o.new_order_items || []).map((item: any) => {
        const serviceLink = itemServices.find((s) => s.order_item_id === item.id)
        return {
          id: item.id,
          description: item.description || '',
          quantity: item.quantity || 1,
          days: item.days || 1,
          unit_price: item.unit_price || 0,
          item_total: item.item_total || 0,
          service_id: serviceLink?.service_id,
        }
      }),
    })),
    locationData: locationData
      ? {
          raw_address: locationData.raw_address || '',
          street: locationData.street || null,
          number: locationData.number || null,
          complement: locationData.complement || null,
          neighborhood: locationData.neighborhood || null,
          city: locationData.city || null,
          state: locationData.state || null,
          postal_code: locationData.postal_code || null,
        }
      : undefined,
    attachments: attachments || [],
  }

  const eventName = event.name || `Evento ${event.number}`

  return (
    <div className="p-8 w-full">
      <div className="max-w-[1600px] mx-auto">
        <Breadcrumb
          items={[
            { label: 'Eventos', href: ROUTES.EVENTS },
            { label: eventName, href: ROUTES.EVENT_DETAILS(id) },
            { label: 'Editar' },
          ]}
          className="mb-6"
        />

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Editar evento</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Evento {event.number}-{event.year}
          </p>
        </div>

        <EventFormWidget eventId={id} initialData={initialData} />
      </div>
    </div>
  )
}
