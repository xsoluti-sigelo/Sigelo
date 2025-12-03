'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getUserData, requireWritePermission } from '@/entities/user'
import { logger } from '@/shared/lib/logger'
import { uuidSchema } from '@/shared/lib/validations/common'
import { ROUTES } from '@/shared/config'

type Result = { success: true } | { success: false; error: string }

export async function deleteVehicleAction(vehicleId: string): Promise<Result> {
  try {
    const result = uuidSchema.safeParse(vehicleId)

    if (!result.success) {
      return {
        success: false,
        error: 'ID de veículo inválido.',
      }
    }

    const validatedId = result.data

    const { tenant_id: tenantId, role } = await getUserData()
    requireWritePermission(role)

    const supabase = await createClient()

    const { error: vehicleError } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', validatedId)
      .eq('tenant_id', tenantId)

    if (vehicleError) {
      logger.error('Failed to delete vehicle', vehicleError, {
        tenantId,
        vehicleId: validatedId,
      })

      if (vehicleError.code === '23503') {
        return { success: false, error: 'Este veículo não pode ser excluído pois está em uso' }
      }
      return {
        success: false,
        error: 'Erro ao excluir veículo. Tente novamente.',
      }
    }

    logger.info('Vehicle deleted successfully', {
      tenantId,
      vehicleId: validatedId,
    })

    revalidateTag(`vehicle-${validatedId}`)
    revalidatePath(ROUTES.VEHICLES)

    return { success: true }
  } catch (error) {
    logger.error(
      'Unexpected error in deleteVehicleAction',
      error instanceof Error ? error : new Error(String(error)),
    )
    return {
      success: false,
      error: 'Erro inesperado ao excluir veículo. Tente novamente.',
    }
  }
}
