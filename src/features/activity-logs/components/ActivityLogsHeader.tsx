'use client'

import { Button } from '@/shared/ui'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { showListUpdatedToast } from '@/shared/lib/toast'
import { LogExportButton } from '@/features/logs'
import type { ActivityLog } from '@/features/activity-logs'

interface ActivityLogsHeaderProps {
  count: number
  logs?: ActivityLog[]
}

export function ActivityLogsHeader({ count, logs = [] }: ActivityLogsHeaderProps) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => {
      setIsRefreshing(false)
      showListUpdatedToast()
    }, 500)
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Logs de Auditoria
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {count} {count === 1 ? 'registro encontrado' : 'registros encontrados'}
          </p>
        </div>

        <div className="flex gap-3">
          <LogExportButton logs={logs} variant="outline" />

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Atualizar lista"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  )
}
