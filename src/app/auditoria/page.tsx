import { Breadcrumb } from '@/shared/ui'
import { getActivityLogs, ActivityLogsHeader, ActivityLogsTable } from '@/features/activity-logs'

interface PageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
  }>
}

export default async function AuditoriaPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page) : 1
  const limit = params.limit ? parseInt(params.limit) : 10

  const { data: logs, count, totalPages } = await getActivityLogs({
    page,
    limit,
  })

  return (
    <div className="p-8 w-full">
      <div className="max-w-[1600px] mx-auto">
        <Breadcrumb items={[{ label: 'Logs de Auditoria' }]} className="mb-6" />

        <ActivityLogsHeader count={count} logs={logs} />

        <ActivityLogsTable logs={logs} currentPage={page} totalPages={totalPages} limit={limit} totalItems={count} />
      </div>
    </div>
  )
}
