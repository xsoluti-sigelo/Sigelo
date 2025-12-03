import { Breadcrumb } from '@/shared/ui'
import { getUsersWithInvites, UsersHeader, UsersTable } from '@/features/user-management'

interface PageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    status?: string
    role?: string
  }>
}

export default async function UsuariosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page) : 1
  const search = params.search || ''
  const status = params.status || ''
  const role = params.role || ''

  const { data, totalPages, count } = await getUsersWithInvites({
    page,
    limit: 10,
    search,
    status,
    role,
  })

  return (
    <div className="p-8 w-full">
      <div className="max-w-[1600px] mx-auto">
        <Breadcrumb items={[{ label: 'Gerenciamento de usuários' }]} className="mb-6" />

        <UsersHeader totalCount={count} />

        <UsersTable users={data as never} currentPage={page} totalPages={totalPages} />
      </div>
    </div>
  )
}
