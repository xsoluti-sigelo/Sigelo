'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { createActivityLog } from '@/features/logs'
import { createEventChangeLogs } from '@/entities/event-change-log'
import { getUserData, requireWritePermission } from '@/entities/user'
import type { RemoveAssignmentInput } from '@/features/operations/lib/validations'
import { assignmentSchema, removeAssignmentSchema } from '@/features/operations/lib/validations'
import { z } from 'zod'

type Result =
  | { success: true }
  | { success: false; error: string; errors?: Record<string, string[]> }

const vehicleAssignmentSchema = assignmentSchema
  .extend({
    vehicleId: z.string().uuid('ID de veículo inválido'),
  })
  .omit({ partyId: true })

export async function assignVehicle(
  input: z.infer<typeof vehicleAssignmentSchema>,
): Promise<Result> {
  try {
    const result = vehicleAssignmentSchema.safeParse(input)

    if (!result.success) {
      return {
        success: false,
        error: 'Dados inválidos.',
        errors: result.error.flatten().fieldErrors,
      }
    }

    const { operationId, vehicleId } = result.data
    const supabase = await createClient()

    const { id: userId, tenant_id: tenantId, role } = await getUserData()
    requireWritePermission(role)

    const { data: operationInfo, error: operationError } = await supabase
      .from('new_operations')
      .select('event_id, vehicle')
      .eq('id', operationId)
      .single()

    if (operationError || !operationInfo) {
      return { success: false, error: 'Operação não encontrada para atribuição' }
    }

    const { data: existingAssignment } = await supabase
      .from('vehicle_assignments')
      .select('id, vehicle_id')
      .eq('molide_operation_id', operationId)
      .eq('tenant_id', tenantId)
      .single()

    let oldVehicleId: string | null = null
    let oldVehiclePlate: string | null = null
    let isUpdate = false

    if (existingAssignment) {
      oldVehicleId = existingAssignment.vehicle_id

      const { data: oldVehicle } = await supabase
        .from('vehicles')
        .select('license_plate')
        .eq('id', existingAssignment.vehicle_id)
        .single()

      oldVehiclePlate = oldVehicle?.license_plate || null
      isUpdate = true

      const { error } = await supabase
        .from('vehicle_assignments')
        .update({ vehicle_id: vehicleId })
        .eq('id', existingAssignment.id)

      if (error) {
        return { success: false, error: 'Erro ao atualizar veículo' }
      }
    } else {
      const { error } = await supabase
        .from('vehicle_assignments')
        .insert({
          tenant_id: tenantId,
          molide_operation_id: operationId,
          vehicle_id: vehicleId,
          assigned_by: userId,
        })
        .select()

      if (error) {
        return { success: false, error: 'Erro ao atribuir veículo' }
      }
    }

    const { data: newVehicle } = await supabase
      .from('vehicles')
      .select('license_plate')
      .eq('id', vehicleId)
      .single()

    const newVehiclePlate = newVehicle?.license_plate

    const { error: updateOpError } = await supabase
      .from('new_operations')
      .update({ vehicle: newVehiclePlate || null })
      .eq('id', operationId)

    if (updateOpError) {
    }

    await createActivityLog({
      action_type: 'ASSIGN_VEHICLE',
      entity_type: 'molide_operation',
      entity_id: operationId,
      old_value:
        isUpdate && oldVehicleId
          ? {
              vehicle_id: oldVehicleId,
              license_plate: oldVehiclePlate || 'Desconhecido',
            }
          : undefined,
      new_value: {
        vehicle_id: vehicleId,
        license_plate: newVehiclePlate || 'Desconhecido',
      },
      metadata: {
        action: isUpdate ? 'update' : 'create',
        ...(oldVehiclePlate && { changed_from: oldVehiclePlate }),
        ...(newVehiclePlate && { changed_to: newVehiclePlate }),
      },
    })

    const previousVehicle = oldVehiclePlate || operationInfo.vehicle || null
    const logResult = await createEventChangeLogs({
      eventId: operationInfo.event_id,
      operationId,
      tenantId,
      changedBy: userId,
      entity: 'OPERATION',
      action: 'UPDATED',
      source: 'assign-vehicle',
      changes: [
        {
          field: 'vehicle',
          oldValue: previousVehicle,
          newValue: newVehiclePlate || null,
        },
      ],
      context: {
        reason: 'assign_vehicle',
        mode: isUpdate ? 'update' : 'create',
      },
    })

    if (!logResult.success) {
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Erro inesperado ao atribuir veículo' }
  }
}

export async function removeVehicleAssignment(input: RemoveAssignmentInput): Promise<Result> {
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
      .from('vehicle_assignments')
      .select('molide_operation_id, vehicle_id')
      .eq('id', assignmentId)
      .eq('tenant_id', tenantId)
      .single()

    let vehiclePlate: string | null = null
    let operationInfo: { event_id: string; vehicle: string | null } | null = null
    if (assignment) {
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('license_plate')
        .eq('id', assignment.vehicle_id)
        .single()
      vehiclePlate = vehicle?.license_plate || null

      const { data: opInfo, error: opFetchError } = await supabase
        .from('new_operations')
        .select('event_id, vehicle')
        .eq('id', assignment.molide_operation_id)
        .single()

      if (opFetchError || !opInfo) {
        return { success: false, error: 'Operação não encontrada para remover veículo' }
      }
      operationInfo = opInfo
    }

    const { error } = await supabase
      .from('vehicle_assignments')
      .delete()
      .eq('id', assignmentId)
      .eq('tenant_id', tenantId)

    if (error) {
      return { success: false, error: 'Erro ao remover veículo' }
    }

    if (assignment) {
      const { error: updateOpError } = await supabase
        .from('new_operations')
        .update({ vehicle: null })
        .eq('id', assignment.molide_operation_id)

      if (updateOpError) {
      }
    }

    if (assignment) {
      await createActivityLog({
        action_type: 'ASSIGN_VEHICLE',
        entity_type: 'molide_operation',
        entity_id: assignment.molide_operation_id,
        old_value: {
          vehicle_id: assignment.vehicle_id,
          license_plate: vehiclePlate || 'Desconhecido',
        },
        new_value: undefined,
        metadata: {
          action: 'remove',
          ...(vehiclePlate && { removed_vehicle: vehiclePlate }),
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
          source: 'assign-vehicle',
          changes: [
            {
              field: 'vehicle',
              oldValue: vehiclePlate || operationInfo.vehicle || null,
              newValue: null,
            },
          ],
          context: {
            reason: 'remove_vehicle',
          },
        })

        if (!logResult.success) {
        }
      }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Erro inesperado ao remover veículo' }
  }
}
