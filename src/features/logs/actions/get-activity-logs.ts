'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { getUserTenantId } from '@/entities/user'
import { logger } from '@/shared/lib/logger'
import type { ActivityLog, LogFilters, LogsResponse } from '../types'
import { logFiltersSchema } from '../schemas'

export async function getActivityLogs(filters: LogFilters = {}): Promise<LogsResponse> {
  try {
    const validation = logFiltersSchema.safeParse(filters)

    if (!validation.success) {
      throw new Error(validation.error.issues[0]?.message || 'Invalid filters')
    }

    const supabase = await createClient()
    const tenantId = await getUserTenantId()

    const {
      page = 1,
      limit = 50,
      user_id,
      action_type,
      entity_type,
      entity_id,
      start_date,
      end_date,
      success,
      search,
    } = validation.data

    const offset = (page - 1) * limit

    let query = supabase
      .from('activity_logs')
      .select(
        `
        *,
        users(id, full_name, email)
      `,
        { count: 'exact' },
      )
      .eq('tenant_id', tenantId)
      .order('timestamp', { ascending: false })

    if (user_id) {
      query = query.eq('user_id', user_id)
    }

    if (action_type) {
      query = query.eq('action_type', action_type as never)
    }

    if (entity_type) {
      query = query.eq('entity_type', entity_type)
    }

    if (entity_id) {
      query = query.eq('entity_id', entity_id)
    }

    if (start_date) {
      query = query.gte('timestamp', start_date)
    }

    if (end_date) {
      query = query.lte('timestamp', end_date)
    }

    if (success !== undefined) {
      query = query.eq('success', success)
    }

    if (search) {
      query = query.or(
        `users.full_name.ilike.%${search}%,users.email.ilike.%${search}%,entity_type.ilike.%${search}%`,
      )
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      logger.error('Error fetching activity logs', error, { tenantId, filters })
      throw error
    }

    const totalPages = count ? Math.ceil(count / limit) : 0

    return {
      data: (data || []) as ActivityLog[],
      totalPages,
      count: count || 0,
    }
  } catch (error) {
    logger.error('Failed to get activity logs', error as Error, { filters })
    throw error
  }
}

export async function getEntityActivityLogs(
  entityType: string,
  entityId: string,
): Promise<ActivityLog[]> {
  try {
    const supabase = await createClient()
    const tenantId = await getUserTenantId()

    const { data, error } = await supabase
      .from('activity_logs')
      .select(
        `
        *,
        users(id, full_name, email)
      `,
      )
      .eq('tenant_id', tenantId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('timestamp', { ascending: false })
      .limit(100)

    if (error) {
      logger.error('Error fetching entity activity logs', error, {
        tenantId,
        entityType,
        entityId,
      })
      throw error
    }

    return (data || []) as ActivityLog[]
  } catch (error) {
    logger.error('Failed to get entity activity logs', error as Error, { entityType, entityId })
    throw error
  }
}
