import { Breadcrumb } from '@/shared/ui'
import { getVehicles } from '@/features/vehicle/api'
import { VehicleListWidget } from '@/features/vehicle/components/VehicleListWidget'

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; limit?: string }>
}

export default async function VeiculosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page) : 1
  const limit = params.limit ? parseInt(params.limit) : 10
  const search = params.search || ''

  const { data: vehicles, totalPages, count } = await getVehicles({ page, limit, search })

  return (
    <div className="p-8 w-full">
      <div className="max-w-[1600px] mx-auto">
        <Breadcrumb items={[{ label: 'Veículos' }]} className="mb-6" />

        <VehicleListWidget
          vehicles={vehicles}
          currentPage={page}
          totalPages={totalPages}
          count={count}
          search={search}
          itemsPerPage={limit}
        />
      </div>
    </div>
  )
}
