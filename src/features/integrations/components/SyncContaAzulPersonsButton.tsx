'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { Button } from '@/shared/ui'
import { syncContaAzulPersons } from '../actions/sync-contaazul-persons'
import { showSuccessToast, showErrorToast } from '@/shared/lib/toast'

export function SyncContaAzulPersonsButton() {
  const [isSyncing, setIsSyncing] = useState(false)
  const router = useRouter()

  const handleSync = async () => {
    setIsSyncing(true)

    try {
      const result = await syncContaAzulPersons()

      if (result.success) {
        showSuccessToast(result.message || 'Pessoas sincronizadas com sucesso!')
        router.refresh()
      } else {
        showErrorToast(result.message || 'Erro ao sincronizar pessoas')
      }
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : 'Erro inesperado ao sincronizar pessoas',
      )
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Button onClick={handleSync} disabled={isSyncing} className="flex items-center gap-2">
      <ArrowPathIcon className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Sincronizando...' : 'Sincronizar Pessoas'}
    </Button>
  )
}
