'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { createActivityLog } from '@/features/logs'
import { createEventChangeLogs } from '@/entities/event-change-log'
import { getUserData, requireWritePermission } from '@/entities/user'
import { AssignmentRole } from '@/shared/config/enums'
import {
  assignmentSchema,
  type RemoveAssignmentInput,
  removeAssignmentSchema,
} from '@/features/operations/lib/validations'
import {
  getDriverInfo,
  getExistingDriverAssignment,
  updateDriverAssignment,
  createDriverAssignment,
  updateOperationDriver,
} from './lib/assignment-helpers'
import { z } from 'zod'
import { logger } from '@/shared/lib/logger'

type Result =
  | { success: true }
  | { success: false; error: string; errors?: Record<string, string[]> }

const driverAssignmentSchema = assignmentSchema
  .extend({
    partyId: z.string().uuid('ID de motorista inválido'),
  })
  .omit({ vehicleId: true })

export async function assignDriver(input: z.infer<typeof driverAssignmentSchema>): Promise<Result> {
  try {
    const result = driverAssignmentSchema.safeParse(input)

    if (!result.success) {
      return {
        success: false,
        error: 'Dados inválidos.',
        errors: result.error.flatten().fieldErrors,
      }
    }

    const { operationId, partyId } = result.data
    const supabase = await createClient()

    const { id: userId, tenant_id: tenantId, role } = await getUserData()
    requireWritePermission(role)

    const { data: operationInfo, error: operationError } = await supabase
      .from('new_operations')
      .select('event_id, driver')
      .eq('id', operationId)
      .single()

    if (operationError || !operationInfo) {
      return { success: false, error: 'Operação não encontrada para atribuição' }
    }

    const existingAssignment = await getExistingDriverAssignment(operationId, tenantId)

    let oldDriverId: string | null = null
    let oldDriverName: string | null = null
    let isUpdate = false

    if (existingAssignment) {
      oldDriverId = existingAssignment.party_id
      const oldDriver = await getDriverInfo(existingAssignment.party_id)
      oldDriverName = oldDriver?.name || null
      isUpdate = true

      const result = await updateDriverAssignment(existingAssignment.id, partyId)
      if (!result.success) {
        return { success: false, error: 'Erro ao atualizar motorista' }
      }
    } else {
      const result = await createDriverAssignment(
        operationId,
        partyId,
        tenantId,
        userId,
        AssignmentRole.DRIVER,
      )
      if (!result.success) {
        return { success: false, error: 'Erro ao atribuir motorista' }
      }
    }

    const newDriver = await getDriverInfo(partyId)
    const newDriverName = newDriver?.name || null

    const updateResult = await updateOperationDriver(operationId, newDriverName)
    if (!updateResult.success) {
      logger.error('Failed to update denormalized driver field', { error: updateResult.error })
    }

    await createActivityLog({
      action_type: 'ASSIGN_DRIVER',
      entity_type: 'molide_operation',
      entity_id: operationId,
      old_value:
        isUpdate && oldDriverId
          ? {
              party_id: oldDriverId,
              driver_name: oldDriverName || 'Desconhecido',
            }
          : undefined,
      new_value: {
        party_id: partyId,
        driver_name: newDriverName || 'Desconhecido',
      },
      metadata: {
        action: isUpdate ? 'update' : 'create',
        ...(oldDriverName && { changed_from: oldDriverName }),
        ...(newDriverName && { changed_to: newDriverName }),
      },
    })

    const previousDriverValue = oldDriverName || operationInfo.driver || null
    const logResult = await createEventChangeLogs({
      eventId: operationInfo.event_id,
      operationId,
      tenantId,
      changedBy: userId,
      entity: 'OPERATION',
      action: 'UPDATED',
      source: 'assign-driver',
      changes: [
        {
          field: 'driver',
          oldValue: previousDriverValue,
          newValue: newDriverName || null,
        },
      ],
      context: {
        reason: 'assign_driver',
        mode: isUpdate ? 'update' : 'create',
      },
    })

    if (!logResult.success) {
      logger.error('Failed to create event change log', { error: logResult.error })
    }


    return { success: true }
  } catch {
    return { success: false, error: 'Erro inesperado ao atribuir motorista' }
  }
}

export async function removeDriverAssignment(input: RemoveAssignmentInput): Promise<Result> {
  try {
    const result = removeAssignmentSchema.safeParse(input)

    if (!result.success) {
      return {
        success: false,
        error: 'ID de atribuição inválido.',
        errors: result.error.flatten().fieldErrors,
      }
    }

    const { assignmentId } = result.data
    const supabase = await createClient()

    const { id: userId, tenant_id: tenantId, role } = await getUserData()
    requireWritePermission(role)

    const { data: assignment } = await supabase
      .from('service_assignments')
      .select('molide_operation_id, party_id')
      .eq('id', assignmentId)
      .eq('tenant_id', tenantId)
      .maybeSingle()

    let driverName: string | null = null
    let operationInfo: { event_id: string; driver: string | null } | null = null

    if (assignment) {
      const driver = await getDriverInfo(assignment.party_id)
      driverName = driver?.name || null

      const { data: opInfo, error: opFetchError } = await supabase
        .from('new_operations')
        .select('event_id, driver')
        .eq('id', assignment.molide_operation_id)
        .single()

      if (opFetchError || !opInfo) {
        return { success: false, error: 'Operação não encontrada para remoção de motorista' }
      }
      operationInfo = opInfo
    }

    const { error } = await supabase
      .from('service_assignments')
      .delete()
      .eq('id', assignmentId)
      .eq('tenant_id', tenantId)

    if (error) {
      return { success: false, error: 'Erro ao remover motorista' }
    }

    if (assignment) {
      const updateResult = await updateOperationDriver(assignment.molide_operation_id, null)
      if (!updateResult.success) {
        logger.error('Failed to update denormalized driver field', { error: updateResult.error })
      }
    }

    if (assignment) {
      await createActivityLog({
        action_type: 'ASSIGN_DRIVER',
        entity_type: 'molide_operation',
        entity_id: assignment.molide_operation_id,
        old_value: {
          party_id: assignment.party_id,
          driver_name: driverName || 'Desconhecido',
        },
        new_value: undefined,
        metadata: {
          action: 'remove',
          ...(driverName && { removed_driver: driverName }),
        },
      })

      if (operationInfo) {
        const logResult = await createEventChangeLogs({
          eventId: operationInfo.event_id,
          operationId: assignment.molide_operation_id,
          tenantId,
          changedBy: userId,
          entity: 'OPERATION',
          action: 'UPDATED',
          source: 'assign-driver',
          changes: [
            {
              field: 'driver',
              oldValue: driverName || operationInfo.driver || null,
              newValue: null,
            },
          ],
          context: {
            reason: 'remove_driver',
          },
        })

        if (!logResult.success) {
          logger.error('Failed to create event change log', { error: logResult.error })
        }
      }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Erro inesperado ao remover motorista' }
  }
}
