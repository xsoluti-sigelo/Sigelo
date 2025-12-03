import { createClient } from '@/shared/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Breadcrumb } from '@/shared/ui'
import { hasWritePermission } from '@/entities/user'
import { VehicleFormWidget } from '@/features/vehicle/components/VehicleFormWidget'
import { ROUTES } from '@/shared/config'

interface EditVehiclePageProps {
  params: Promise<{ id: string }>
}

export default async function EditVehiclePage({ params }: EditVehiclePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(ROUTES.LOGIN)
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('google_id', user.id)
    .single()

  const userRole = profile?.role || 'VIEWER'

  if (!hasWritePermission(userRole)) {
    redirect(ROUTES.VEHICLES)
  }

  const { data: vehicle, error } = await supabase.from('vehicles').select('*').eq('id', id).single()

  if (error || !vehicle) {
    notFound()
  }

  const vehicleName = `${vehicle.brand} ${vehicle.model} - ${vehicle.license_plate}`

  return (
    <div className="p-8 w-full">
      <div className="max-w-[1600px] mx-auto">
        <Breadcrumb
          items={[
            { label: 'Veículos', href: ROUTES.VEHICLES },
            { label: vehicleName, href: ROUTES.VEHICLE_DETAILS(id) },
            { label: 'Editar' },
          ]}
          className="mb-6"
        />

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Editar Veículo</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Detalhes e informações de {vehicleName}
          </p>
        </div>

        <VehicleFormWidget onSuccess={() => {}} />
      </div>
    </div>
  )
}
