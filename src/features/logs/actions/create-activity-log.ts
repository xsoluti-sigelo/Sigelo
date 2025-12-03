'use server'

import { getUserId, getUserTenantId } from '@/entities/user'
import { headers } from 'next/headers'
import { createAuditLog, type AuditAction } from '@/entities/audit-log'
import { logger } from '@/shared/lib/logger'
import type { CreateLogParams } from '../types'
import { createLogSchema } from '../schemas'
import type { Json } from '@/types/database.types'

const deriveAuditAction = (actionType: string): AuditAction => {
  const normalized = actionType.toLowerCase()
  if (normalized.includes('login')) return 'LOGIN'
  if (normalized.includes('logout')) return 'LOGOUT'
  if (normalized.includes('delete') || normalized.includes('remove')) return 'DELETE'
  if (normalized.includes('status')) return 'STATUS_CHANGE'
  if (normalized.includes('generate')) return 'GENERATE'
  if (normalized.includes('export')) return 'EXPORT'
  if (normalized.includes('import') || normalized.includes('sync')) return 'IMPORT'
  if (normalized.includes('create')) return 'CREATE'
  if (normalized.includes('update')) return 'UPDATE'
  return 'OTHER'
}

export async function createActivityLog(params: CreateLogParams) {
  try {
    const validation = createLogSchema.safeParse(params)

    if (!validation.success) {
      logger.warn('Invalid log creation params', {
        errors: validation.error.issues,
        params,
      })
      return { success: false, error: 'Invalid log params' }
    }

    const userId = await getUserId()
    const tenantId = await getUserTenantId()

    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip')
    const userAgent = headersList.get('user-agent')
    const pageUrl = headersList.get('referer')

    const { createAdminClient } = await import('@/shared/lib/supabase/admin')
    const adminClient = createAdminClient()

    const insertData = {
      tenant_id: tenantId,
      user_id: userId,
      action_type: validation.data.action_type,
      entity_type: validation.data.entity_type || null,
      entity_id: validation.data.entity_id || null,
      old_value: (validation.data.old_value as Json) || null,
      new_value: (validation.data.new_value as Json) || null,
      ip_address: ip || null,
      user_agent: userAgent || null,
      page_url: pageUrl || null,
      success: validation.data.success ?? true,
      error_message: validation.data.error_message || null,
      metadata: (validation.data.metadata as Json) || null,
    }

    const { error } = await adminClient.from('activity_logs').insert(insertData)

    if (error) {
      logger.error('Failed to create activity log', error, {
        tenantId,
        userId,
        actionType: params.action_type,
      })
      return { success: false, error: error.message }
    }

    await createAuditLog({
      action: deriveAuditAction(params.action_type),
      entityType: params.entity_type,
      entityId: params.entity_id,
      description:
        typeof params.metadata?.description === 'string' ? params.metadata.description : undefined,
      metadata: params.metadata || undefined,
      success: params.success ?? true,
      errorMessage: params.error_message,
      tenantId,
      userId,
    })

    return { success: true }
  } catch (error) {
    logger.error('Failed to create activity log', error as Error, {
      actionType: params.action_type,
    })
    return { success: false, error: 'Failed to log activity' }
  }
}
