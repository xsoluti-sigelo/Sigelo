import { createEventChangeLogs } from '@/entities/event-change-log'
import type { Json } from '@/types/database.types'
import type { ReplaceOperationsOptions, LogContextPayload } from '../../types/operation.types'
import type { UserContext } from '../../model/shared-types'

const buildContextPayload = (options?: ReplaceOperationsOptions): Json | null => {
  const context: LogContextPayload = {
    reason: 'operation_regeneration',
    generator: options?.generator ?? 'deterministic',
    ...options?.context,
  }

  const entries = Object.entries(context).filter(([, value]) => value !== undefined)
  return entries.length ? (Object.fromEntries(entries) as Json) : null
}

export async function recordOperationRegenerationLog(
  eventId: string,
  userData: UserContext,
  counts: { pendingRemoved: number; insertedCount: number; completedCount: number },
  options?: ReplaceOperationsOptions,
) {
  const logResult = await createEventChangeLogs({
    eventId,
    tenantId: userData.tenant_id,
    changedBy: userData.id,
    entity: 'OPERATION',
    action: 'UPDATED',
    changes: [
      {
        field: 'operations',
        oldValue: {
          pending_operations: counts.pendingRemoved,
          completed_operations: counts.completedCount,
        },
        newValue: {
          generated_operations: counts.insertedCount,
          completed_operations: counts.completedCount,
          total_operations: counts.completedCount + counts.insertedCount,
        },
      },
    ],
    source: 'generate-operations',
    context: buildContextPayload(options),
  })

  if (!logResult.success) {
  }
}
