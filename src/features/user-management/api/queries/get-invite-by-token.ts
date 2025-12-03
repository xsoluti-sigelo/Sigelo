'use server'

import { logger } from '@/shared/lib/logger'

export async function getInviteByToken(token: string) {
  const { createAdminClient } = await import('@/shared/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('user_invites')
    .select(
      `
      id,
      tenant_id,
      email,
      full_name,
      role,
      status,
      expires_at,
      created_at
    `,
    )
    .eq('invite_token', token)
    .eq('status', 'PENDING')
    .single()

  if (error) {
    logger.error('Error fetching invite by token', error)
    return null
  }

  if (data && new Date((data as never)['expires_at']) < new Date()) {
    return null
  }

  return data
}
