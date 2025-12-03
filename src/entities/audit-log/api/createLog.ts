'use server'

import { headers } from 'next/headers'
import { logger } from '@/shared/lib/logger'
import { getUserData } from '@/entities/user'
import { createAdminClient } from '@/shared/lib/supabase/admin'

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'STATUS_CHANGE'
  | 'GENERATE'
  | 'EXPORT'
  | 'IMPORT'
  | 'OTHER'

export interface CreateAuditLogParams {
  action: AuditAction
  entityType?: string | null
  entityId?: string | null
  description?: string | null
  metadata?: Record<string, unknown> | null
  success?: boolean
  errorMessage?: string | null
  tenantId?: string
  userId?: string
  ipAddress?: string | null
  userAgent?: string | null
}

export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    let tenantId = params.tenantId
    let userId = params.userId

    if (!tenantId) {
      try {
        const { tenant_id } = await getUserData()
        tenantId = tenant_id
      } catch (error) {
        logger.warn('Failed to resolve tenant for audit log', {
          error,
          action: params.action,
        })
      }
    }

    if (!userId) {
      try {
        const { id } = await getUserData()
        userId = id
      } catch {
      }
    }

    if (!tenantId) {
      logger.warn('Skipping audit log due to missing tenant_id', {
        action: params.action,
        entity: params.entityType,
        entityId: params.entityId,
      })
      return { success: false, error: 'Missing tenant_id' }
    }

    const headersList = await headers()
    const ip =
      params.ipAddress || headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || null
    const userAgent = params.userAgent || headersList.get('user-agent')

    const adminClient = createAdminClient()

    const { error } = await adminClient.from('audit_logs').insert({
      tenant_id: tenantId,
      user_id: userId || null,
      action: params.action,
      entity_type: params.entityType || null,
      entity_id: params.entityId || null,
      description: params.description || null,
      metadata: params.metadata || null,
      ip_address: ip,
      user_agent: userAgent || null,
      success: params.success ?? true,
      error_message: params.errorMessage || null,
    } as never)

    if (error) {
      logger.error('Failed to create audit log', error, {
        tenantId,
        userId,
        action: params.action,
      })
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    logger.error('Unexpected error creating audit log', error as Error, {
      action: params.action,
    })
    return { success: false, error: 'Failed to create audit log' }
  }
}
