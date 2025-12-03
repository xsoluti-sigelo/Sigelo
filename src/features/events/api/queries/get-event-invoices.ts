import { createClient } from '@/shared/lib/supabase/server'
import { getUserData } from '@/entities/user'

export interface EventInvoiceWithPath {
  id: string
  invoice_id_conta_azul: string | null
  invoice_number: number | null
  of_numbers: string[] | null
  created_at: string
  success: boolean
  invoice_path: string | null
}

export async function getEventInvoices(eventId: string): Promise<EventInvoiceWithPath[]> {
  if (eventId.startsWith('event-')) {
    return []
  }

  const supabase = await createClient()
  const { tenant_id } = await getUserData()

  const { data, error } = await supabase
    .from('invoice_generation_logs' as never)
    .select(
      'id, invoice_id_conta_azul, invoice_number, of_numbers, created_at, success, invoice_path',
    )
    .eq('new_event_id', eventId)
    .eq('tenant_id', tenant_id)
    .eq('success', true)
    .not('invoice_path', 'is', null)
    .order('created_at', { ascending: false })

  if (error) {
    return []
  }

  return (data || []) as EventInvoiceWithPath[]
}
