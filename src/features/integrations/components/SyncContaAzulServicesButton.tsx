'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { Button } from '@/shared/ui'
import { syncContaAzulServices } from '../actions/sync-services'
import { showSuccessToast, showErrorToast } from '@/shared/lib/toast'

export function SyncContaAzulServicesButton() {
  const router = useRouter()
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)

    try {
      const result = await syncContaAzulServices()

      if (result.success) {
        const count = result.count ?? 0
        showSuccessToast(
          `${count} servico${count === 1 ? '' : 's'} sincronizado${count === 1 ? '' : 's'} com sucesso!`,
        )
        router.refresh()
      } else {
        showErrorToast(result.error || 'Erro ao sincronizar servicos')
      }
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : 'Erro inesperado ao sincronizar servicos',
      )
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Button onClick={handleSync} disabled={isSyncing} className="flex items-center gap-2">
      <ArrowPathIcon className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Sincronizando...' : 'Sincronizar Servicos'}
    </Button>
  )
}
