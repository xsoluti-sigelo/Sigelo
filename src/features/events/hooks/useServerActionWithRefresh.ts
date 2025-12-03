'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface UseServerActionWithRefreshOptions<T> {
  onSuccess?: (state: T) => void
  onError?: (error: string) => void
}

export function useServerActionWithRefresh<T extends { success: boolean; error?: string }>(
  action: (prevState: T | null, formData: FormData) => Promise<T>,
  options: UseServerActionWithRefreshOptions<T> = {},
) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<T | null, FormData>(action, null)
  const onSuccessRef = useRef(options.onSuccess)
  const onErrorRef = useRef(options.onError)

  useEffect(() => {
    onSuccessRef.current = options.onSuccess
    onErrorRef.current = options.onError
  }, [options.onSuccess, options.onError])

  useEffect(() => {
    if (state?.success) {
      onSuccessRef.current?.(state)
      router.refresh()
    } else if (state && !state.success && state.error) {
      onErrorRef.current?.(state.error)
    }
  }, [state, router])

  return {
    state,
    formAction,
    isPending,
    isSuccess: state?.success ?? false,
    error: state?.error,
  }
}
