'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getUserData, requireWritePermission } from '@/entities/user'
import { logger } from '@/shared/lib/logger'
import { updateVehicleSchema, type UpdateVehicleInput } from '@/shared/lib/validations/vehicle'
import { ROUTES } from '@/shared/config'

type Result =
  | { success: true }
  | { success: false; error: string; errors?: Record<string, string[]> }

export async function updateVehicleAction(input: UpdateVehicleInput): Promise<Result> {
  try {
    const result = updateVehicleSchema.safeParse(input)

    if (!result.success) {
      return {
        success: false,
        error: 'Dados inválidos. Verifique os campos e tente novamente.',
        errors: result.error.flatten().fieldErrors,
      }
    }

    const { vehicleId, data: validatedData } = result.data

    const { tenant_id: tenantId, role } = await getUserData()
    requireWritePermission(role)

    const supabase = await createClient()

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      ...validatedData,
    }

    const { error: vehicleError } = await supabase
      .from('vehicles')
      .update(updateData)
      .eq('id', vehicleId)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (vehicleError) {
      logger.error('Failed to update vehicle', vehicleError, {
        tenantId,
        vehicleId,
      })

      if (vehicleError.code === '23505') {
        return {
          success: false,
          error: 'Já existe um veículo cadastrado com esta placa',
        }
      }

      return {
        success: false,
        error: 'Erro ao atualizar veículo. Tente novamente.',
      }
    }

    logger.info('Vehicle updated successfully', { tenantId, vehicleId })

    revalidateTag(`vehicle-${vehicleId}`)
    revalidatePath(ROUTES.VEHICLES)

    return { success: true }
  } catch (error) {
    logger.error(
      'Unexpected error in updateVehicleAction',
      error instanceof Error ? error : new Error(String(error)),
    )
    return {
      success: false,
      error: 'Erro inesperado ao atualizar veículo. Tente novamente.',
    }
  }
}
