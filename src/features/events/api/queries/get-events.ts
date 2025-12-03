import { createClient } from '@/shared/lib/supabase/server'
import type { Database } from '@/types/database.types'
import type { EventDisplay, GetEventsParams, NewEventQueryResult } from '../../model'

export async function getEvents({
  page = 1,
  limit = 10,
  search = '',
  status,
  start_date,
  end_date,
}: GetEventsParams = {}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('google_id', user.id)
    .single()

  if (!userData?.tenant_id) {
    throw new Error('Tenant not found')
  }

  let query = supabase
    .from('new_events')
    .select(
      `
      id,
      number,
      year,
      name,
      date,
      start_date,
      end_date,
      start_time,
      end_time,
      location,
      contract,
      is_night_event,
      is_intermittent,
      event_type,
      status,
      created_at,
      email_id,
      new_orders(id, number, total_value, is_cancelled),
      new_events_contaazul_pessoas(
        contaazul_pessoas(
          id,
          name,
          cnpj
        )
      ),
      new_emails(received_at)
    `,
      { count: 'exact' },
    )
    .neq('source', 'NOT_LISTABLE')

  if (status) {
    const upperStatus = status.toUpperCase()
    query = query.eq('status', upperStatus as Database['public']['Enums']['event_status_enum'])
  }

  if (start_date) {
    query = query.gte('date', start_date)
  }

  if (end_date) {
    query = query.lte('date', end_date)
  }

  const hasSearch = search && search.trim()
  const from = hasSearch ? 0 : (page - 1) * limit
  const to = hasSearch ? 999 : from + limit - 1 // Fetch up to 1000 when searching

  const {
    data,
    error,
    count: totalCount,
  } = await query.order('date', { ascending: false }).range(from, to)

  if (error) {
    throw new Error('Failed to fetch events')
  }

  let eventsDisplay: EventDisplay[] = (data || ([] as never[])).map(
    transformNewEventToDisplay as never,
  )

  if (hasSearch) {
    const searchLower = search.toLowerCase().trim()
    eventsDisplay = eventsDisplay.filter((event) => {
      return (
        event.client_name?.toLowerCase().includes(searchLower) ||
        event.contract_name?.toLowerCase().includes(searchLower) ||
        event.contract_number?.toLowerCase().includes(searchLower) ||
        event.id?.toLowerCase().includes(searchLower)
      )
    })
  }

  const filteredCount = hasSearch ? eventsDisplay.length : totalCount || 0
  const totalPages = Math.ceil(filteredCount / limit)

  if (hasSearch) {
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    eventsDisplay = eventsDisplay.slice(startIndex, endIndex)
  }

  return {
    data: eventsDisplay,
    totalPages,
    count: filteredCount,
  }
}

export function transformNewEventToDisplay(event: NewEventQueryResult): EventDisplay {
  const eventValue = (event.new_orders || []).reduce(
    (sum, order) => sum + (order.is_cancelled ? 0 : Number(order.total_value)),
    0,
  )

  let status: string

  if (event.status) {
    status = event.status.toLowerCase()
  } else {
    const hasActiveOrders = (event.new_orders || []).some((o) => !o.is_cancelled)
    const allCancelled =
      (event.new_orders || []).length > 0 && (event.new_orders || []).every((o) => o.is_cancelled)

    if (allCancelled) {
      status = 'cancelled'
    } else if (!hasActiveOrders && (event.new_orders || []).length === 0) {
      status = 'draft'
    } else {
      status = 'completed'
    }
  }

  const startDatetime = `${event.start_date || event.date}T${event.start_time}`
  const endDatetime = event.end_time ? `${event.end_date || event.date}T${event.end_time}` : null

  const clientData = event.new_events_contaazul_pessoas?.[0]?.contaazul_pessoas
  const clientName = clientData?.name || 'Sem cliente'
  const clientCnpj = clientData?.cnpj || ''

  const fullEventName =
    event.number && event.year && event.name
      ? `${event.number} ${event.year} - ${event.name}`
      : event.name || 'Sem título'

  const emailReceivedAt = event.new_emails?.received_at || null

  return {
    id: event.id,
    client_id: clientCnpj,
    client_name: clientName,
    contract_name: fullEventName,
    contract_number: event.contract || '-',
    event_type: event.event_type || 'SINGLE_OCCURRENCE',
    status,
    start_date: startDatetime,
    end_date: endDatetime,
    payment_date: null,
    event_value: eventValue,
    received_at: emailReceivedAt,
  }
}
