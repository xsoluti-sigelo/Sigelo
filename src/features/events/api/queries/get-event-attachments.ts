import { createClient } from '@/shared/lib/supabase/server'

export async function getEventAttachments(eventId: string) {
  if (eventId.startsWith('event-')) {
    return []
  }

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
    .from('event_attachments' as never)
    .select(
      `
      id,
      file_name,
      file_type,
      file_size,
      storage_path,
      created_at
    `,
    )
    .eq('event_id', eventId)
    .eq('tenant_id', userData.tenant_id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch event attachments')
  }

  return data || []
}
