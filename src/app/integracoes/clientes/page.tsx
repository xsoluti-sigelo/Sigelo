import { getContaAzulPessoas } from '@/features/integrations/contaazul/api'
import { ContaAzulPersonsHeader, ContaAzulPersonsTable } from '@/features/integrations'
import { formatPersonsForTable } from '@/features/integrations/lib'
import { PAGINATION } from '@/features/integrations/lib/constants'
import { Breadcrumb } from '@/shared/ui'

interface ContaAzulPersonsPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    person_type?: string
    profile?: string
    active?: string
  }>
}

export default async function ContaAzulPersonsPage({ searchParams }: ContaAzulPersonsPageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = params.search || ''
  const person_type = params.person_type || ''
  const profile = params.profile || ''
  const active = params.active || ''

  const {
    data: persons,
    total,
    totalPages,
  } = await getContaAzulPessoas({
    page,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    search,
    person_type,
    profile,
    active,
  })

  const formattedPersons = formatPersonsForTable(persons)

  return (
    <div className="p-8 w-full">
      <div className="max-w-[1600px] mx-auto">
        <Breadcrumb
          items={[{ label: 'Integrações', href: '/integracoes/conexao' }, { label: 'Clientes' }]}
          className="mb-6"
        />

        <ContaAzulPersonsHeader count={total} />

        <ContaAzulPersonsTable
          persons={formattedPersons}
          currentPage={page}
          totalPages={totalPages}
        />
      </div>
    </div>
  )
}
