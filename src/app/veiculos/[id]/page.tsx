import { createClient } from '@/shared/lib/supabase/server'
import { VehicleDetailsWidget } from '@/features/vehicle/components/VehicleDetailsWidget'
import { Breadcrumb } from '@/shared/ui'
import { notFound } from 'next/navigation'
import { hasWritePermission, isAdmin } from '@/entities/user'
import { logger } from '@/shared/lib/logger'
import type { Metadata } from 'next'

import { ROUTES } from '@/shared/config'

interface VehicleDetailsPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: VehicleDetailsPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('license_plate, brand, model')
    .eq('id', id)
    .single()

  const vehicleName = vehicle
    ? `${vehicle.brand} ${vehicle.model} - ${vehicle.license_plate}`
    : 'Veículos'

  return {
    title: `${vehicleName} - Veículos - Sigelo`,
    description: `Detalhes e informações de ${vehicleName}`,
  }
}

export default async function VehicleDetailsPage({ params }: VehicleDetailsPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('google_id', user.id)
    .single()

  const userRole = profile?.role || 'VIEWER'
  const canEdit = hasWritePermission(userRole)
  const canDelete = isAdmin(userRole)

  const { data: vehicle, error } = await supabase.from('vehicles').select('*').eq('id', id).single()

  if (error) {
    logger.error('Error fetching vehicle', error, { vehicleId: id })
    notFound()
  }

  if (!vehicle) {
    logger.warn('Vehicle not found', { vehicleId: id })
    notFound()
  }

  const vehicleName = `${vehicle.brand} ${vehicle.model} - ${vehicle.license_plate}`

  return (
    <div className="p-8 w-full">
      <div className="max-w-[1600px] mx-auto">
        <Breadcrumb
          items={[{ label: 'Veículos', href: ROUTES.VEHICLES }, { label: vehicleName }]}
          className="mb-6"
        />

        <VehicleDetailsWidget
          vehicle={{
            ...vehicle,
            active: vehicle.active ?? false,
            cobli_number: vehicle.cobli_number ?? null,
            fuel_type: vehicle.fuel_type ?? null,
            size_category: vehicle.size_category ?? null,
            fuel_consumption_km_per_liter: vehicle.fuel_consumption_km_per_liter ?? null,
            speed_limit_kmh: vehicle.speed_limit_kmh ?? null,
            tags: vehicle.tags ?? null,
            notes: vehicle.notes ?? null,
            created_at: vehicle.created_at ?? new Date().toISOString(),
            updated_at: vehicle.updated_at ?? null,
          }}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </div>
    </div>
  )
}
