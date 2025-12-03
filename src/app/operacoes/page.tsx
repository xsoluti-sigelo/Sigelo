import { Breadcrumb } from '@/shared/ui'
import { getOperations, getDrivers, getVehicles } from '@/features/operations'
import { OperationsPageClient } from '@/features/operations'
import { OperationType, OperationStatus } from '@/features/operations/config/operations-config'
import { getAllContaAzulServices } from '@/features/integrations/contaazul/api'

interface PageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    event_search?: string
    of_search?: string
    operation_type?: string
    status?: string
    start_date?: string
    end_date?: string
    limit?: string
  }>
}

export default async function MolidePage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page) : 1
  const limit = params.limit ? parseInt(params.limit) : 10
  const search = params.search || ''
  const event_search = params.event_search || ''
  const of_search = params.of_search || ''
  const operation_type = params.operation_type as OperationType | undefined
  const status = params.status as OperationStatus | undefined
  const start_date = params.start_date || ''
  const end_date = params.end_date || ''

  const [operationsResult, drivers, vehicles, services] = await Promise.all([
    getOperations({
      page,
      limit,
      search,
      event_search,
      of_search,
      operation_type,
      status,
      start_date,
      end_date,
    }),
    getDrivers(),
    getVehicles(),
    getAllContaAzulServices(),
  ])

  const { data: operations, totalPages, count } = operationsResult

  return (
    <div className="p-8 w-full">
      <div className="max-w-[1600px] mx-auto">
        <Breadcrumb items={[{ label: 'Operações' }]} className="mb-6" />

        <OperationsPageClient
          operations={operations}
          currentPage={page}
          totalPages={totalPages}
          count={count}
          search={search}
          limit={limit}
          drivers={drivers}
          vehicles={vehicles}
          services={services}
        />
      </div>
    </div>
  )
}
