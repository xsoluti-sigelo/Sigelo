'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { getUserTenantId } from '@/entities/user'
import { logger } from '@/shared/lib/logger'
import type { AuditAction } from './createLog'
import type { AuditLog } from '../model/types'

interface GetAuditLogsParams {
  page?: number
  limit?: number
  user_id?: string
  action?: AuditAction
  entity_type?: string
  entity_id?: string
  start_date?: string
  end_date?: string
  success?: boolean
}

export async function getAuditLogs({
  page = 1,
  limit = 50,
  user_id,
  action,
  entity_type,
  entity_id,
  start_date,
  end_date,
  success,
}: GetAuditLogsParams = {}) {
  const supabase = await createClient()
  const tenantId = await getUserTenantId()

  const offset = (page - 1) * limit

  let query = supabase
    .from('audit_logs')
    .select(
      `
      *,
      users(id, full_name, email)
    `,
      { count: 'exact' },
    )
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (user_id) {
    query = query.eq('user_id', user_id)
  }

  if (action) {
    query = query.eq('action', action)
  }

  if (entity_type) {
    query = query.eq('entity_type', entity_type)
  }

  if (entity_id) {
    query = query.eq('entity_id', entity_id)
  }

  if (typeof success === 'boolean') {
    query = query.eq('success', success)
  }

  if (start_date) {
    query = query.gte('created_at', start_date)
  }

  if (end_date) {
    query = query.lte('created_at', end_date)
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1)

  if (error) {
    logger.error('Error fetching audit logs', error, { tenantId })
    throw error
  }

  const totalPages = count ? Math.ceil(count / limit) : 0

  return {
    data: (data || []) as AuditLog[],
    totalPages,
    count: count || 0,
  }
}
