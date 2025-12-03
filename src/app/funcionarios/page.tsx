import { Breadcrumb } from '@/shared/ui'
import { getEmployees } from '@/features/employee/api'
import { EMPLOYEE_TEXTS } from '@/features/employee'
import { EmployeeListWidget } from '@/widgets/employee'

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; limit?: string }>
}

export default async function FuncionariosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page) : 1
  const limit = params.limit ? parseInt(params.limit) : 10
  const search = params.search || ''

  const { data: employees, totalPages, count } = await getEmployees({ page, limit, search })

  return (
    <div className="p-8 w-full">
      <div className="max-w-[1600px] mx-auto">
        <Breadcrumb items={[{ label: EMPLOYEE_TEXTS.BREADCRUMB }]} className="mb-6" />

        <EmployeeListWidget
          employees={employees}
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
