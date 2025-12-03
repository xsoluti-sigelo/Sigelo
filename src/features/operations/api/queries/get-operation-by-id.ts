import { createClient } from '@/shared/lib/supabase/server'
import { requireUserTenant } from '@/features/operations/lib/auth'

export async function getOperationById(id: string) {
  const supabase = await createClient()
  const { tenantId } = await requireUserTenant()

  const { data, error } = await supabase
    .from('new_operations')
    .select(
      `
      *,
      new_events(
        id,
        number,
        year,
        name,
        event_type,
        date,
        start_date,
        end_date,
        start_time,
        end_time,
        location,
        source,
        cleaning_rule,
        event_locations(
          id,
          raw_address,
          formatted_address,
          latitude,
          longitude,
          geocoding_status
        ),
        new_events_contaazul_pessoas(
          contaazul_pessoas(
            id,
            name,
            cnpj
          )
        )
      )
    `,
    )
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single()

  if (error?.code === 'PGRST116' || !data) {
    return null
  }

  if (error) {
    throw new Error('Failed to fetch operation')
  }

  const { data: ordersData } = await supabase
    .from('new_orders')
    .select(
      `
      id,
      number,
      is_cancelled,
      new_order_items(
        id,
        description,
        quantity
      )
    `,
    )
    .eq('event_id', data.new_events.id)

  const { data: eventProducersData } = await supabase
    .from('new_people')
    .select('*')
    .eq('event_id', data.new_events.id)
    .in('role', ['producer', 'coordinator'])

  const transformedProducers = (eventProducersData || []).map((person) => ({
    id: person.id,
    event_id: person.event_id,
    party_id: person.id,
    is_primary: person.is_primary || false,
    parties: {
      id: person.id,
      display_name: person.name,
      full_name: person.name,
      party_type: person.role,
      party_contacts: person.phone
        ? [
            {
              id: `${person.id}-contact`,
              party_id: person.id,
              contact_type: 'MOBILE' as const,
              contact_value: person.phone,
              is_primary: true,
              active: true,
            },
          ]
        : [],
    },
  }))

  const transformedOrders = (ordersData || []).map((order) => ({
    id: order.id,
    of_number: order.number,
    is_cancelled: order.is_cancelled || false,
    of_status: order.is_cancelled ? 'CANCELLED' : 'ACTIVE',
    of_items: (order.new_order_items || []).map((item) => ({
      id: item.id,
      quantity: item.quantity,
      equipment_types: {
        id: item.id,
        name: item.description,
        category: item.description?.toUpperCase().includes('PCD')
          ? 'BANHEIRO_PCD'
          : 'BANHEIRO_PADRAO',
      },
    })),
  }))

  const clientData = data.new_events.new_events_contaazul_pessoas?.[0]?.contaazul_pessoas

  const normalizedEvent = {
    ...data.new_events,
    order_fulfillments: transformedOrders,
    event_producers: transformedProducers,
    contaazul_pessoas: clientData,
  }

  return {
    ...data,
    events: normalizedEvent,
  }
}
