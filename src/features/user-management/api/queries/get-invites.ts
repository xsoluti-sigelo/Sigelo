'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'
import { getUserTenantId } from '@/entities/user'
import { logger } from '@/shared/lib/logger'

export async function getInvites({
  page = 1,
  limit = 10,
  search = '',
  status = '',
}: {
  page?: number
  limit?: number
  search?: string
  status?: string
}) {
  const supabase = createAdminClient()
  const tenantId = await getUserTenantId()

  if (!tenantId) {
    throw new Error('Tenant ID not found')
  }

  const offset = (page - 1) * limit

  let query = supabase
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
      invited_by,
      users!user_invites_invited_by_fkey(
        id,
        full_name,
        email
      )
    `,
      { count: 'exact' },
    )
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
  }

  if (status) {
    query = query.eq('status', status as 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED')
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1)

  if (error) {
    logger.error('Error fetching invites', error, { tenantId })
    throw error
  }

  const totalPages = count ? Math.ceil(count / limit) : 0

  return {
    data: data || [],
    totalPages,
    count: count || 0,
  }
}
