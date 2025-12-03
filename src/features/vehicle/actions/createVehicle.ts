'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getUserData, requireWritePermission } from '@/entities/user'
import { logger } from '@/shared/lib/logger'
import { vehicleSchema, type VehicleFormData } from '@/shared/lib/validations/vehicle'
import { ROUTES } from '@/shared/config'

type Result =
  | { success: true }
  | { success: false; error: string; errors?: Record<string, string[]> }

export async function createVehicleAction(input: VehicleFormData): Promise<Result> {
  try {
    const result = vehicleSchema.safeParse(input)

    if (!result.success) {
      return {
        success: false,
        error: 'Dados inválidos. Verifique os campos e tente novamente.',
        errors: result.error.flatten().fieldErrors,
      }
    }

    const validatedData = result.data

    const { tenant_id: tenantId, role } = await getUserData()
    requireWritePermission(role)

    const supabase = await createClient()

    const vehicleData = {
      tenant_id: tenantId,
      license_plate: validatedData.license_plate,
      model: validatedData.model,
      brand: validatedData.brand,
      year: validatedData.year,
      module_capacity: validatedData.module_capacity,
      cobli_number: validatedData.cobli_number || null,
      fuel_type: validatedData.fuel_type || null,
      size_category: validatedData.size_category || null,
      fuel_consumption_km_per_liter: validatedData.fuel_consumption_km_per_liter || null,
      speed_limit_kmh: validatedData.speed_limit_kmh || null,
      tags: validatedData.tags && validatedData.tags.length > 0 ? validatedData.tags : null,
      notes: validatedData.notes || null,
      active: true,
    }

    const { error: vehicleError } = await supabase
      .from('vehicles' as never)
      .insert(vehicleData as never)
      .select()
      .single()

    if (vehicleError) {
      logger.error('Failed to create vehicle', vehicleError, {
        tenantId,
        licensePlate: validatedData.license_plate,
      })

      if (vehicleError.code === '23505') {
        return {
          success: false,
          error: 'Já existe um veículo cadastrado com esta placa',
        }
      }

      return {
        success: false,
        error: 'Erro ao criar veículo. Tente novamente.',
      }
    }

    logger.info('Vehicle created successfully', {
      tenantId,
      licensePlate: validatedData.license_plate,
    })

    revalidatePath(ROUTES.VEHICLES)

    return { success: true }
  } catch (error) {
    logger.error(
      'Unexpected error in createVehicleAction',
      error instanceof Error ? error : new Error(String(error)),
    )
    return {
      success: false,
      error: 'Erro inesperado ao criar veículo. Tente novamente.',
    }
  }
}
