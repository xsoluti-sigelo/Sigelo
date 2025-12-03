'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { getUserTenantId } from '@/entities/user'
import { logger } from '@/shared/lib/logger'
import type { ActivityLog, LogStats, ActionType } from '../types'
import { LogStatsService } from '../services'

export async function getLogStats(filters?: {
  start_date?: string
  end_date?: string
}): Promise<LogStats> {
  try {
    const supabase = await createClient()
    const tenantId = await getUserTenantId()

    let query = supabase
      .from('activity_logs')
      .select(
        `
        *,
        users(id, full_name, email)
      `,
      )
      .eq('tenant_id', tenantId)

    if (filters?.start_date) {
      query = query.gte('timestamp', filters.start_date)
    }

    if (filters?.end_date) {
      query = query.lte('timestamp', filters.end_date)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching logs for stats', error, { tenantId, filters })
      throw error
    }

    const logs = (data || []) as ActivityLog[]
    const statsService = new LogStatsService(logs)

    return statsService.getStats()
  } catch (error) {
    logger.error('Failed to get log stats', error as Error, { filters })
    throw error
  }
}

export async function getActionTypeCounts(filters?: {
  start_date?: string
  end_date?: string
}): Promise<Array<{ action: ActionType; count: number }>> {
  try {
    const supabase = await createClient()
    const tenantId = await getUserTenantId()

    let query = supabase.from('activity_logs').select('action_type').eq('tenant_id', tenantId)

    if (filters?.start_date) {
      query = query.gte('timestamp', filters.start_date)
    }

    if (filters?.end_date) {
      query = query.lte('timestamp', filters.end_date)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching action type counts', error, { tenantId, filters })
      throw error
    }

    const counts = new Map<ActionType, number>()

    for (const item of data || []) {
      const action = item.action_type as ActionType
      counts.set(action, (counts.get(action) || 0) + 1)
    }

    return Array.from(counts.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
  } catch (error) {
    logger.error('Failed to get action type counts', error as Error, { filters })
    throw error
  }
}
