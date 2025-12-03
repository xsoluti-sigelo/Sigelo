import { createClient } from '@/shared/lib/supabase/server'
import { requireUserTenant } from '@/features/operations/lib/auth'

export async function getVehicles() {
  const supabase = await createClient()
  const { tenantId } = await requireUserTenant()

  const { data, error } = await supabase
    .from('vehicles')
    .select('id, license_plate, brand, model')
    .eq('tenant_id', tenantId)
    .eq('active', true)
    .order('license_plate')

  if (error) {
    throw new Error('Failed to fetch vehicles')
  }

  return data || []
}
