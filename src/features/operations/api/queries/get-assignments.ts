import { createClient } from '@/shared/lib/supabase/server'
import { requireUserTenant } from '@/features/operations/lib/auth'
import { logger } from '@/shared/lib/logger'

export async function getOperationAssignments(operationId: string) {
  const supabase = await createClient()
  const { tenantId } = await requireUserTenant()

  const { data: serviceAssignments, error: serviceError } = await supabase
    .from('service_assignments')
    .select(
      `
      id,
      party_id,
      assignment_role,
      parties(
        id,
        display_name,
        full_name
      )
    `,
    )
    .eq('molide_operation_id', operationId)
    .eq('tenant_id', tenantId)

  if (serviceError) {
    logger.error('Error fetching service assignments', { message: serviceError.message, details: serviceError.details })
  }

  const { data: vehicleAssignments, error: vehicleError } = await supabase
    .from('vehicle_assignments')
    .select(
      `
      id,
      vehicle_id,
      tenant_id,
      molide_operation_id,
      created_at,
      vehicles(
        id,
        license_plate,
        brand,
        model
      )
    `,
    )
    .eq('molide_operation_id', operationId)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1)

  if (vehicleError) {
    logger.error('Error fetching vehicle assignment', { message: vehicleError.message, details: vehicleError.details })
  }

  return {
    serviceAssignments: serviceAssignments || [],
    vehicleAssignment: vehicleAssignments?.[0] || null,
  }
}
