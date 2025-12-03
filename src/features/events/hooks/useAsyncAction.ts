'use client'

import { useState, useTransition } from 'react'

interface ActionResult {
  success: boolean
  error?: string
  message?: string
}

interface UseAsyncActionOptions<T extends ActionResult> {
  onSuccess?: (result: T, id: string) => void
  onError?: (error: string, id: string) => void
}

export function useAsyncAction<T extends ActionResult>(options: UseAsyncActionOptions<T> = {}) {
  const [isPending, startTransition] = useTransition()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const execute = async (id: string, actionFn: () => Promise<T>): Promise<void> => {
    setProcessingId(id)
    startTransition(async () => {
      try {
        const result = await actionFn()

        if (result.success) {
          options.onSuccess?.(result, id)
        } else {
          options.onError?.(result.error || 'Erro ao executar ação', id)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao executar ação'
        options.onError?.(errorMessage, id)
      } finally {
        setProcessingId(null)
      }
    })
  }

  return {
    execute,
    isPending,
    processingId,
    isProcessing: (id: string) => processingId === id,
    isAnyProcessing: processingId !== null,
  }
}
