import { createClient } from '@/shared/lib/supabase/server'

export async function getEventForEdit(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id, role')
    .eq('google_id', user.id)
    .single()

  if (!userData?.tenant_id) {
    throw new Error('Tenant not found')
  }

  const { data: event, error: eventError } = await supabase
    .from('new_events')
    .select(
      `
      *,
      new_events_contaazul_pessoas (
        pessoa_id
      )
    `,
    )
    .eq('id', id)
    .single()

  if (eventError || !event) {
    return null
  }

  const { data: people } = await supabase
    .from('new_people')
    .select('*')
    .eq('event_id', id)
    .order('created_at')

  const { data: orders } = await supabase
    .from('new_orders')
    .select(
      `
      *,
      new_order_items (
        *
      )
    `,
    )
    .eq('event_id', id)
    .order('created_at')

  const { data: eventServices } = await supabase
    .from('new_events_contaazul_services')
    .select('service_id')
    .eq('event_id', id)

  const orderItemIds = orders?.flatMap((o) => o.new_order_items?.map((item) => item.id) || []) || []
  const { data: itemServices } =
    orderItemIds.length > 0
      ? await supabase
          .from('new_order_items_contaazul_services')
          .select('order_item_id, service_id')
          .in('order_item_id', orderItemIds)
      : { data: [] }

  const { data: locationData } = await supabase
    .from('event_locations')
    .select('*')
    .eq('event_id', id)
    .eq('is_primary', true)
    .maybeSingle()

  const { data: attachments } = await supabase
    .from('event_attachments')
    .select('*')
    .eq('event_id', id)
    .order('created_at', { ascending: false })

  return {
    event,
    people: people || [],
    orders: orders || [],
    eventServices: eventServices || [],
    itemServices: itemServices || [],
    locationData: locationData || null,
    attachments: attachments || [],
    userRole: userData.role,
  }
}
