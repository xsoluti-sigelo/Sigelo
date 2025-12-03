import { createClient } from '@/shared/lib/supabase/server'
import { transformNewEventToDisplay } from './get-events'

export async function getEventById(id: string) {
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

  const { data, error } = await supabase
    .from('new_events')
    .select(
      `
      *,
      new_orders(id, number, total_value, is_cancelled),
      new_events_contaazul_pessoas(
        contaazul_pessoas(
          name,
          cnpj
        )
      )
    `,
    )
    .eq('id', id)
    .eq('tenant_id', userData.tenant_id)
    .single()

  if (error?.code === 'PGRST116' || !data) {
    return null
  }

  if (error) {
    throw new Error('Failed to fetch event')
  }

  return transformNewEventToDisplay(data as never)
}
