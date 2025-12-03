import { createClient } from '@/shared/lib/supabase/server'
import type { EventInvoice } from '../../model'

export type { EventInvoice }

export async function getEventInvoice(eventId: string): Promise<EventInvoice | null> {
  if (eventId.startsWith('event-')) {
    return null
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoice_generation_logs' as never)
    .select(
      'id, invoice_id_conta_azul, invoice_number, of_numbers, created_at, success, invoice_path',
    )
    .eq('event_id', eventId)
    .eq('success', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return null
  }

  if (!data) {
    return null
  }

  return data as EventInvoice
}
