'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { logger } from '@/shared/lib/logger'

export type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER'

export async function getUserId(): Promise<string> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { createAdminClient } = await import('@/shared/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { data: userData, error } = await adminClient
    .from('users')
    .select('id, active')
    .eq('google_id', user.id)
    .single()

  if (error || !userData?.id) {
    logger.error('User ID not found for authenticated user', error, {
      googleId: user.id,
    })
    throw new Error('User ID not found')
  }

  if (userData.active === false) {
    logger.warn('Inactive user attempted access', {
      userId: userData.id,
      googleId: user.id,
    })
    throw new Error('User account is inactive')
  }

  return userData.id
}

export async function getUserTenantId(): Promise<string> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { createAdminClient } = await import('@/shared/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { data: userData, error } = await adminClient
    .from('users')
    .select('tenant_id, active')
    .eq('google_id', user.id)
    .single()

  if (error || !userData?.tenant_id) {
    logger.error('Tenant not found for authenticated user', error, {
      googleId: user.id,
    })
    throw new Error('Tenant not found')
  }

  if (userData.active === false) {
    logger.warn('Inactive user attempted access', {
      googleId: user.id,
    })
    throw new Error('User account is inactive')
  }

  return userData.tenant_id
}

export async function getUserRole(): Promise<UserRole> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { createAdminClient } = await import('@/shared/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { data: userData, error } = await adminClient
    .from('users')
    .select('role, active')
    .eq('google_id', user.id)
    .single()

  if (error || !userData?.role) {
    logger.error('User role not found for authenticated user', error, {
      googleId: user.id,
    })
    throw new Error('User role not found')
  }

  if (userData.active === false) {
    logger.warn('Inactive user attempted access', {
      googleId: user.id,
    })
    throw new Error('User account is inactive')
  }

  return userData.role as UserRole
}


export async function getUserData(): Promise<{
  id: string
  tenant_id: string
  role: UserRole
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { createAdminClient } = await import('@/shared/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { data: userData, error } = await adminClient
    .from('users')
    .select('id, tenant_id, role, active')
    .eq('google_id', user.id)
    .single()

  if (error || !userData?.tenant_id || !userData?.role) {
    logger.error('User data not found for authenticated user', error, {
      googleId: user.id,
    })
    throw new Error('User data not found')
  }

  if (userData.active === false) {
    logger.warn('Inactive user attempted access', {
      userId: userData.id,
      googleId: user.id,
      tenantId: userData.tenant_id,
    })
    throw new Error('User account is inactive')
  }

  return {
    id: userData.id,
    tenant_id: userData.tenant_id,
    role: userData.role as UserRole,
  }
}

export async function _getUserDataByGoogleId(googleId: string): Promise<{
  id: string
  tenant_id: string
  role: UserRole
}> {
  const { createAdminClient } = await import('@/shared/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { data: userData, error } = await adminClient
    .from('users')
    .select('id, tenant_id, role, active')
    .eq('google_id', googleId)
    .single()

  if (error || !userData?.tenant_id || !userData?.role) {
    logger.error('User data not found for google ID', error, {
      googleId,
    })
    throw new Error('User data not found')
  }

  if (userData.active === false) {
    logger.warn('Inactive user attempted access via googleId lookup', {
      userId: userData.id,
      googleId,
      tenantId: userData.tenant_id,
    })
    throw new Error('User account is inactive')
  }

  logger.info('User data fetched by googleId', {
    userId: userData.id,
    tenantId: userData.tenant_id,
    googleId,
  })

  return {
    id: userData.id,
    tenant_id: userData.tenant_id,
    role: userData.role as UserRole,
  }
}
