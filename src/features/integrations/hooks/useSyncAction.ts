'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { showSuccessToast, showErrorToast } from '@/shared/lib/toast'

interface ActionResult {
  success: boolean
  message?: string
  error?: string
}

interface UseSyncActionOptions {
  successMessage?: string
  errorMessage?: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useSyncAction(
  syncAction: () => Promise<ActionResult>,
  options: UseSyncActionOptions = {},
) {
  const router = useRouter()
  const [isSyncing, setIsSyncing] = useState(false)

  const { successMessage, errorMessage, onSuccess, onError } = options

  const handleSync = async () => {
    setIsSyncing(true)

    try {
      const result = await syncAction()

      if (result.success) {
        showSuccessToast(result.message || successMessage || 'Sincronizado com sucesso!')
        router.refresh()
        onSuccess?.()
      } else {
        const error = result.error || result.message || errorMessage || 'Erro ao sincronizar'
        showErrorToast(error)
        onError?.(error)
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : errorMessage || 'Erro inesperado ao sincronizar'
      showErrorToast(errorMsg)
      onError?.(errorMsg)
    } finally {
      setIsSyncing(false)
    }
  }

  return {
    handleSync,
    isSyncing,
  }
}
