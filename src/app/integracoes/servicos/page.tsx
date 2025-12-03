import { Breadcrumb } from '@/shared/ui'
import { getContaAzulServices, getLastSyncDate } from '@/features/integrations/contaazul/api'
import { ServicesHeader } from '@/features/integrations/components/ServicesHeader'
import { ServicesTable } from '@/features/integrations/components/ServicesTable'
import { formatServicesForTable } from '@/features/integrations/lib'

type FilterValue = 'with' | 'without' | 'missing'

const parseFilterValue = (value?: string | null): FilterValue | undefined => {
  if (value === 'with' || value === 'without' || value === 'missing') {
    return value
  }
  return undefined
}

interface ServicesPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    cost_filter?: string
    price_filter?: string
  }>
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = params.search || ''
  const costFilter = parseFilterValue(params.cost_filter)
  const priceFilter = parseFilterValue(params.price_filter)

  const [servicesData, lastSyncedAt] = await Promise.all([
    getContaAzulServices({
      page,
      search,
      costFilter,
      priceFilter,
    }),
    getLastSyncDate(),
  ])

  const formattedServices = formatServicesForTable(servicesData.services)

  return (
    <div className="p-8 w-full">
      <div className="max-w-[1600px] mx-auto">
        <Breadcrumb
          items={[{ label: 'Integrações', href: '/integracoes/conexao' }, { label: 'Serviços' }]}
          className="mb-6"
        />

        <ServicesHeader count={servicesData.totalCount} lastSyncedAt={lastSyncedAt} />

        <ServicesTable
          services={formattedServices}
          currentPage={servicesData.currentPage}
          totalPages={servicesData.totalPages}
        />
      </div>
    </div>
  )
}
