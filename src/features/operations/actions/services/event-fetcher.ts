import type { EventRow, SupabaseClient } from '../../model/shared-types'

export async function fetchEventRecord(
  supabase: SupabaseClient,
  eventId: string,
): Promise<EventRow | null> {
  const { data, error } = await supabase.from('new_events').select('*').eq('id', eventId).single()

  if (error) {
    return null
  }

  return data
}

export function shouldUseDeterministicGenerator(event: EventRow): boolean {
  return event.source === 'MANUAL'
}
