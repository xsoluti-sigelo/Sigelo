'use server'

import { getUserData } from '@/entities/user'
import { logger } from '@/shared/lib/logger'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import type { Database } from '@/types/database.types'
import type { EventChangeLogInput, JsonValue } from '../model/types'
import { normalizeJsonValue } from '../lib/build-field-changes'

type EventChangeLogInsert = Database['public']['Tables']['event_change_logs']['Insert']

interface CreateEventChangeLogResult {
  success: boolean
  error?: string
}

interface UserContext {
  userId: string | null
  tenantId: string | null
  userName: string | null
}

const createDefaultUserContext = (): UserContext => ({
  userId: null,
  tenantId: null,
  userName: null,
})

const ensureUserContext = async (
  needsTenant: boolean,
  needsUserId: boolean,
  needsUserName: boolean,
  adminClient: ReturnType<typeof createAdminClient>,
): Promise<UserContext> => {
  if (!needsTenant && !needsUserId && !needsUserName) {
    return createDefaultUserContext()
  }

  const { id, tenant_id } = await getUserData()

  let fullName: string | null = null

  if (needsUserName) {
    const { data, error } = await adminClient
      .from('users')
      .select('full_name')
      .eq('id', id)
      .single()

    if (error) {
      logger.error('Failed to fetch user full name for event logs', error, { userId: id })
    } else {
      fullName = data?.full_name ?? null
    }
  }

  return {
    userId: needsUserId ? id : null,
    tenantId: needsTenant ? tenant_id : null,
    userName: needsUserName ? fullName : null,
  }
}

const toArray = <T>(value: T | T[]): T[] => (Array.isArray(value) ? value : [value])

const fallbackChanges = (
  input: EventChangeLogInput,
): Array<{ field?: string; oldValue?: JsonValue | null; newValue?: JsonValue | null }> => {
  if (input.changes && input.changes.length > 0) {
    return input.changes
  }

  if (input.field || input.oldValue !== undefined || input.newValue !== undefined) {
    return [
      {
        field: input.field,
        oldValue: input.oldValue ?? null,
        newValue: input.newValue ?? null,
      },
    ]
  }

  return [
    {
      field: undefined,
      oldValue: null,
      newValue: null,
    },
  ]
}

const normalizeContext = (value: JsonValue | null | undefined) =>
  value === undefined ? null : normalizeJsonValue(value)

export async function createEventChangeLogs(
  payload: EventChangeLogInput | EventChangeLogInput[],
): Promise<CreateEventChangeLogResult> {
  const logs = toArray(payload)

  if (logs.length === 0) {
    return { success: true }
  }

  const adminClient = createAdminClient()

  const requiresTenant = logs.some((log) => !log.tenantId)
  const requiresUser = logs.some((log) => !log.changedBy)
  const requiresUserName = logs.some((log) => !log.changedByName)

  const userContext = await ensureUserContext(
    requiresTenant,
    requiresUser,
    requiresUserName,
    adminClient,
  )

  const rows: EventChangeLogInsert[] = []

  for (const log of logs) {
    const tenantId = log.tenantId ?? userContext.tenantId

    if (!tenantId) {
      logger.error(
        'Missing tenant_id when creating event change log',
        new Error('Missing tenant context'),
        {
          eventId: log.eventId,
          action: log.action,
        },
      )
      return {
        success: false,
        error: 'Tenant não encontrado para salvar o histórico do evento',
      }
    }

    const changedBy = log.changedBy ?? userContext.userId
    const changedByName = log.changedByName ?? userContext.userName
    const context = normalizeContext(log.context ?? null)

    const resolvedChanges = fallbackChanges(log)

    for (const change of resolvedChanges) {
      rows.push({
        tenant_id: tenantId,
        event_id: log.eventId,
        operation_id: log.operationId ?? null,
        entity: log.entity,
        action: log.action,
        field: change.field ?? null,
        old_value: normalizeJsonValue(change.oldValue ?? null),
        new_value: normalizeJsonValue(change.newValue ?? null),
        changed_by: changedBy,
        changed_by_name: changedByName,
        source: log.source ?? 'app',
        context,
      })
    }
  }

  if (rows.length === 0) {
    return { success: true }
  }

  const { error } = await adminClient.from('event_change_logs').insert(rows as never)

  if (error) {
    logger.error('Failed to insert event change logs', error, {
      eventIds: Array.from(new Set(rows.map((row) => row.event_id))),
    })
    return {
      success: false,
      error: 'Não foi possível salvar o histórico do evento',
    }
  }

  return { success: true }
}
