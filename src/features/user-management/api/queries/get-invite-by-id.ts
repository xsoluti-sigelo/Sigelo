'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'
import { getUserTenantId } from '@/entities/user'
import { logger } from '@/shared/lib/logger'

export async function getInviteById(id: string) {
  const supabase = createAdminClient()
  const tenantId = await getUserTenantId()

  if (!tenantId) {
    throw new Error('Tenant ID not found')
  }

  const { data, error } = await supabase
    .from('user_invites')
    .select(
      `
      id,
      email,
      full_name,
      role,
      status,
      invite_token,
      expires_at,
      accepted_at,
      cancelled_at,
      created_at,
      updated_at,
      invited_by,
      cancelled_by,
      users!user_invites_invited_by_fkey(
        id,
        full_name,
        email
      )
    `,
    )
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single()

  if (error) {
    logger.error('Error fetching invite', error, { inviteId: id, tenantId })
    throw error
  }

  return data
}
