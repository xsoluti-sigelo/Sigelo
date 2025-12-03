'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createActivityLog } from '@/features/logs'
import type { JsonValue } from '@/entities/activity-log/model/types'
import { createEventChangeLogs, buildEventFieldChanges } from '@/entities/event-change-log'
import { getUserData, requireWritePermission } from '@/entities/user'
import type { Database } from '@/types/database.types'
import { type UpdateOperationInput, updateOperationSchema } from '@/features/operations/lib/validations'
import { ROUTES } from '@/shared/config'

type Result =
  | { success: true }
  | { success: false; error: string; errors?: Record<string, string[]> }

export async function updateOperation(input: UpdateOperationInput): Promise<Result> {
  try {
    const result = updateOperationSchema.safeParse(input)

    if (!result.success) {
      return {
        success: false,
        error: 'Dados inválidos. Verifique os campos e tente novamente.',
        errors: result.error.flatten().fieldErrors,
      }
    }

    const { operationId, data } = result.data

    const { id: userId, tenant_id: tenantId, role } = await getUserData()
    requireWritePermission(role)

    const supabase = await createClient()

    const { data: currentOperation, error: fetchError } = await supabase
      .from('new_operations')
      .select('*, new_events(number, name)')
      .eq('id', operationId)
      .single()

    if (fetchError || !currentOperation) {
      return { success: false, error: 'Operação não encontrada' }
    }

    const oldValues: Record<string, JsonValue> = {}
    const newValues: Record<string, JsonValue> = {}

    for (const [key, newValue] of Object.entries(data)) {
      const oldValue = currentOperation[key as keyof typeof currentOperation]
      if (oldValue !== newValue) {
        oldValues[key] = oldValue as JsonValue
        newValues[key] = newValue as JsonValue
      }
    }

    const { error } = await supabase
      .from('new_operations')
      .update({
        ...(data as unknown as Database['public']['Tables']['new_operations']['Update']),
        updated_at: new Date().toISOString(),
      })
      .eq('id', operationId)

    if (error) {
      return { success: false, error: 'Erro ao atualizar operação' }
    }

    const changedFields = Object.keys(oldValues)

    if (changedFields.length > 0) {
      const nextOperationState = {
        ...currentOperation,
        ...data,
      } as typeof currentOperation

      const fieldChanges = buildEventFieldChanges(currentOperation, nextOperationState, {
        fields: changedFields,
      })

      if (fieldChanges.length > 0) {
        const actionType = fieldChanges.some((change) => change.field === 'status')
          ? 'STATUS_CHANGED'
          : 'UPDATED'

        const logResult = await createEventChangeLogs({
          eventId: currentOperation.event_id,
          operationId,
          tenantId,
          changedBy: userId,
          entity: 'OPERATION',
          action: actionType,
          changes: fieldChanges,
          source: 'update-operation',
          context: {
            reason: 'operation_update',
          },
        })

        if (!logResult.success) {
        }
      }

      await createActivityLog({
        action_type: 'UPDATE_MOLIDE_OPERATION',
        entity_type: 'operation',
        entity_id: operationId,
        old_value: oldValues,
        new_value: newValues,
        metadata: {
          event_number:
            currentOperation.new_events && 'number' in currentOperation.new_events
              ? currentOperation.new_events.number
              : null,
          event_name:
            currentOperation.new_events && 'name' in currentOperation.new_events
              ? currentOperation.new_events.name
              : null,
          operation_type: currentOperation.type,
        },
      })
    }

    revalidatePath(ROUTES.OPERATIONS)
    revalidatePath(`/operacoes/${operationId}`)

    return { success: true }
  } catch {
    return { success: false, error: 'Erro inesperado ao atualizar operação' }
  }
}
