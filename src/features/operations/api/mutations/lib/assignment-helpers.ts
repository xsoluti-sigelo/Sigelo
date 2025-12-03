import { createClient } from '@/shared/lib/supabase/server'
import { logger } from '@/shared/lib/logger'

interface DriverInfo {
  id: string
  name: string | null
}

export async function getDriverInfo(partyId: string): Promise<DriverInfo | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('parties')
    .select('id, display_name')
    .eq('id', partyId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    name: data.display_name,
  }
}

export async function updateOperationDriver(
  operationId: string,
  driverName: string | null,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('new_operations')
    .update({ driver: driverName })
    .eq('id', operationId)

  if (error) {
    logger.error('Error updating operation driver field', { error })
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function updateOperationVehicle(
  operationId: string,
  vehiclePlate: string | null,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('new_operations')
    .update({ vehicle: vehiclePlate })
    .eq('id', operationId)

  if (error) {
    logger.error('Error updating operation vehicle field', { error })
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function getExistingDriverAssignment(
  operationId: string,
  tenantId: string,
): Promise<{ id: string; party_id: string } | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('service_assignments')
    .select('id, party_id')
    .eq('molide_operation_id', operationId)
    .eq('tenant_id', tenantId)
    .maybeSingle()

  if (error) {
    logger.error('Error fetching existing driver assignment', { error })
    return null
  }

  return data
}

export async function getExistingVehicleAssignment(
  operationId: string,
  tenantId: string,
): Promise<{ id: string; vehicle_id: string } | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vehicle_assignments')
    .select('id, vehicle_id')
    .eq('molide_operation_id', operationId)
    .eq('tenant_id', tenantId)
    .maybeSingle()

  if (error) {
    logger.error('Error fetching existing vehicle assignment', { error })
    return null
  }

  return data
}

export async function updateDriverAssignment(
  assignmentId: string,
  newPartyId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('service_assignments')
    .update({ party_id: newPartyId })
    .eq('id', assignmentId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function createDriverAssignment(
  operationId: string,
  partyId: string,
  tenantId: string,
  userId: string,
  assignmentRole: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from('service_assignments').insert({
    tenant_id: tenantId,
    molide_operation_id: operationId,
    party_id: partyId,
    assignment_role: assignmentRole,
    assigned_by: userId,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function updateVehicleAssignment(
  assignmentId: string,
  newVehicleId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('vehicle_assignments')
    .update({ vehicle_id: newVehicleId })
    .eq('id', assignmentId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function createVehicleAssignment(
  operationId: string,
  vehicleId: string,
  tenantId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from('vehicle_assignments').insert({
    tenant_id: tenantId,
    molide_operation_id: operationId,
    vehicle_id: vehicleId,
    assigned_by: userId,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function getVehicleInfo(vehicleId: string): Promise<{
  id: string
  license_plate: string
} | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vehicles')
    .select('id, license_plate')
    .eq('id', vehicleId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}
