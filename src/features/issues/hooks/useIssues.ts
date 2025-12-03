'use client'

import { useState } from 'react'
import { resolveIssue, ignoreIssue } from '../actions'
import { showSuccessToast, showErrorToast } from '@/shared/lib/toast'

interface UseIssuesOptions {
  onSuccess?: (issueId: string, action: 'resolve' | 'ignore') => void
  onError?: (error: string) => void
}

export function useIssues(options?: UseIssuesOptions) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [isPending, setIsPending] = useState(false)

  const isProcessing = (issueId: string) => processingIds.has(issueId)

  const handleResolve = async (issueId: string, eventId: string) => {
    setIsPending(true)
    setProcessingIds((prev) => new Set(prev).add(issueId))

    try {
      const result = await resolveIssue(issueId, eventId)

      if (result.success) {
        showSuccessToast(result.message || 'Issue resolvido com sucesso')
        options?.onSuccess?.(issueId, 'resolve')
      } else {
        showErrorToast(result.error || 'Erro ao resolver issue')
        options?.onError?.(result.error || 'Erro desconhecido')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado'
      showErrorToast(message)
      options?.onError?.(message)
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev)
        next.delete(issueId)
        return next
      })
      setIsPending(false)
    }
  }

  const handleIgnore = async (issueId: string, eventId: string, notes?: string) => {
    setIsPending(true)
    setProcessingIds((prev) => new Set(prev).add(issueId))

    try {
      const result = await ignoreIssue(issueId, eventId, notes)

      if (result.success) {
        showSuccessToast(result.message || 'Issue ignorado com sucesso')
        options?.onSuccess?.(issueId, 'ignore')
      } else {
        showErrorToast(result.error || 'Erro ao ignorar issue')
        options?.onError?.(result.error || 'Erro desconhecido')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado'
      showErrorToast(message)
      options?.onError?.(message)
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev)
        next.delete(issueId)
        return next
      })
      setIsPending(false)
    }
  }

  return {
    handleResolve,
    handleIgnore,
    isProcessing,
    isPending,
  }
}
