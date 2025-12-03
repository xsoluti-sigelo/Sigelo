import { createClient } from '@/shared/lib/supabase/server'
import type { Vehicle, GetVehiclesParams } from '../../types'
import { logger } from '@/shared/lib/logger'

export async function getVehicles({ page = 1, limit = 10, search }: GetVehiclesParams = {}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const userData = await supabase
    .from('users')
    .select('tenant_id')
    .eq('google_id', user.id)
    .single()

  if (!userData.data) {
    throw new Error('User not found')
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('vehicles' as never)
    .select('*', { count: 'exact' })
    .eq('tenant_id', userData.data.tenant_id)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search) {
    query = query.or(
      `license_plate.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`,
    )
  }

  const { data, error, count } = await query

  if (error) {
    logger.error('Error fetching vehicles', error, {
      tenantId: userData.data.tenant_id,
    })
    throw new Error('Failed to fetch vehicles')
  }

  const totalPages = count ? Math.ceil(count / limit) : 0

  return {
    data: (data || []) as Vehicle[],
    totalPages,
    count: count || 0,
  }
}
