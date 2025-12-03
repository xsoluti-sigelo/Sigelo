import { createClient } from '@/shared/lib/supabase/server'
import type { Vehicle } from '../../types'
import { unstable_cache } from 'next/cache'
import { logger } from '@/shared/lib/logger'

export async function getVehicleById(id: string) {
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

  const getCachedVehicle = unstable_cache(
    async (vehicleId: string, tenant: string) => {
      const { data, error } = await supabase
        .from('vehicles' as never)
        .select('*')
        .eq('id', vehicleId)
        .eq('tenant_id', tenant)
        .single()

      if (error) {
        logger.error('Error fetching vehicle', error, {
          vehicleId,
          tenantId: tenant,
        })
        throw new Error('Vehicle not found')
      }

      return data as Vehicle
    },
    [`vehicle-${id}`],
    {
      tags: [`vehicle-${id}`],
      revalidate: 60,
    },
  )

  return getCachedVehicle(id, userData.data.tenant_id)
}
