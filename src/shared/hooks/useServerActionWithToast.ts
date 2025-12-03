'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { showSuccessToast, showErrorToast } from '@/shared/lib/toast'

interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

interface UseServerActionWithToastOptions<TResult> {
  successMessage?: string | ((result: TResult) => string)
  errorMessage?: string
  onSuccess?: (result: TResult) => void | Promise<void>
  onError?: (error: string) => void | Promise<void>
  refreshOnSuccess?: boolean
  redirectOnSuccess?: string
  showSuccessToast?: boolean
  showErrorToast?: boolean
}

export function useServerActionWithToast<TInput, TResult = void>(
  action: (input: TInput) => Promise<ActionResult<TResult>>,
  options: UseServerActionWithToastOptions<TResult> = {},
) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    successMessage,
    errorMessage = 'Erro ao processar a requisição',
    onSuccess,
    onError,
    refreshOnSuccess = true,
    redirectOnSuccess,
    showSuccessToast: shouldShowSuccessToast = true,
    showErrorToast: shouldShowErrorToast = true,
  } = options

  const execute = async (input: TInput): Promise<ActionResult<TResult>> => {
    let result: ActionResult<TResult>

    try {
      result = await action(input)

      if (result.success) {
        if (shouldShowSuccessToast && successMessage) {
          const message =
            typeof successMessage === 'function'
              ? successMessage(result.data as TResult)
              : successMessage
          showSuccessToast(message)
        }

        if (onSuccess) {
          await onSuccess(result.data as TResult)
        }

        startTransition(() => {
          if (redirectOnSuccess) {
            router.push(redirectOnSuccess)
          } else if (refreshOnSuccess) {
            router.refresh()
          }
        })
      } else {
        if (shouldShowErrorToast) {
          showErrorToast(result.error || errorMessage)
        }

        if (onError) {
          await onError(result.error || errorMessage)
        }
      }

      return result
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : errorMessage

      if (shouldShowErrorToast) {
        showErrorToast(errorMsg)
      }

      if (onError) {
        await onError(errorMsg)
      }

      return {
        success: false,
        error: errorMsg,
      }
    }
  }

  return {
    execute,
    isPending,
  }
}
