import { createClient } from '@/shared/lib/supabase/server'
import { requireUserTenant } from '@/features/operations/lib/auth'

export async function getDrivers() {
  const supabase = await createClient()
  const { tenantId } = await requireUserTenant()

  const { data, error } = await supabase
    .from('parties')
    .select(
      `
      id,
      display_name,
      full_name,
      party_employees!inner(employee_number, is_driver)
    `,
    )
    .eq('tenant_id', tenantId)
    .eq('party_type', 'PERSON')
    .eq('party_employees.is_driver', true)
    .eq('party_employees.active', true)
    .eq('active', true)
    .order('display_name')

  if (error) {
    throw new Error('Failed to fetch drivers')
  }

  return (data || []).map((party) => ({
    id: party.id,
    display_name: party.display_name,
    full_name: party.full_name,
    employee_number: party.party_employees?.[0]?.employee_number,
  }))
}
