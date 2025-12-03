'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'
import { getUserTenantId } from '@/entities/user'
import { logger } from '@/shared/lib/logger'

export async function getUsersWithInvites({
  page = 1,
  limit = 10,
  search = '',
  status = '',
  role = '',
}: {
  page?: number
  limit?: number
  search?: string
  status?: string
  role?: string
}) {
  const supabase = createAdminClient()
  const tenantId = await getUserTenantId()

  if (!tenantId) {
    throw new Error('Tenant ID not found')
  }

  let usersQuery = supabase
    .from('users')
    .select('id, email, full_name, role, active, last_login_at, created_at, picture_url')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (search) {
    usersQuery = usersQuery.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
  }

  if (role) {
    usersQuery = usersQuery.eq('role', role as never)
  }

  if (status === 'ACTIVE') {
    usersQuery = usersQuery.eq('active', true)
  } else if (status === 'INACTIVE') {
    usersQuery = usersQuery.eq('active', false)
  }

  let invitesQuery = supabase
    .from('user_invites')
    .select('id, email, full_name, role, status, expires_at, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (status && ['PENDING', 'EXPIRED', 'CANCELLED'].includes(status)) {
    invitesQuery = invitesQuery.eq(
      'status',
      status as 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED',
    )
  } else if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
    invitesQuery = invitesQuery.in('status', ['PENDING', 'EXPIRED'])
  } else {
    invitesQuery = invitesQuery.eq('id', '00000000-0000-0000-0000-000000000000')
  }

  if (search) {
    invitesQuery = invitesQuery.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
  }

  if (role) {
    invitesQuery = invitesQuery.eq('role', role as never)
  }

  const [usersResult, invitesResult] = await Promise.all([usersQuery, invitesQuery])

  if (usersResult.error) {
    logger.error('Error fetching users', usersResult.error, { tenantId })
    throw usersResult.error
  }

  if (invitesResult.error) {
    logger.error('Error fetching invites', invitesResult.error, { tenantId })
    throw invitesResult.error
  }

  const users = (usersResult.data || []).map((user) => ({
    ...user,
    is_invite: false,
  }))

  const invites = ((invitesResult.data || []) as never[]).map((invite: never) => ({
    id: invite['id'],
    email: invite['email'],
    full_name: invite['full_name'] || '',
    role: invite['role'],
    active: false,
    last_login_at: null,
    created_at: invite['created_at'],
    picture_url: undefined,
    is_invite: true,
    invite_status: invite['status'],
    invite_expires_at: invite['expires_at'],
    invite_id: invite['id'],
  }))

  const combined = [...users, ...invites].sort((a, b) => {
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  })

  const offset = (page - 1) * limit
  const paginatedData = combined.slice(offset, offset + limit)
  const totalPages = Math.ceil(combined.length / limit)

  return {
    data: paginatedData,
    totalPages,
    count: combined.length,
    activeUsersCount: users.length,
    pendingInvitesCount: invites.length,
  }
}
