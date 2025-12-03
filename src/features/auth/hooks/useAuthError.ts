'use client'

import { useState, useCallback } from 'react'
import { authErrorHandlerService } from '../services'
import type { AuthError } from '../model/types'

interface UseAuthErrorReturn {
  error: AuthError | null
  setError: (error: unknown) => void
  clearError: () => void
  retry: <T>(fn: () => Promise<T>) => Promise<{ data: T | null; error: AuthError | null }>
}

export function useAuthError(): UseAuthErrorReturn {
  const [error, setErrorState] = useState<AuthError | null>(null)

  const setError = useCallback((err: unknown) => {
    const authError = authErrorHandlerService.handleError(err)
    setErrorState(authError)
  }, [])

  const clearError = useCallback(() => {
    setErrorState(null)
  }, [])

  const retry = useCallback(
    async <T>(fn: () => Promise<T>) => {
      clearError()
      return authErrorHandlerService.executeWithRetry(fn)
    },
    [clearError],
  )

  return {
    error,
    setError,
    clearError,
    retry,
  }
}
