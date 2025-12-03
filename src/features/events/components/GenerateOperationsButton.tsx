'use client'

import { generateOperations } from '@/features/events/actions'
import { Button } from '@/shared/ui'
import { showSuccessToast, showErrorToast } from '@/shared/lib/toast'
import { useServerActionWithRefresh } from '../hooks'

interface GenerateOperationsButtonProps {
  eventId: string
  canDelegate?: boolean
  disabledMessage?: string
}

export function GenerateOperationsButton({
  eventId,
  canDelegate = true,
  disabledMessage,
}: GenerateOperationsButtonProps) {
  const { formAction, isPending } = useServerActionWithRefresh(generateOperations, {
    onSuccess: (result) => {
      if (!result.success) {
        return
      }
      const count = ('operationsCount' in result ? result.operationsCount : 0) || 0
      const message =
        count === 0
          ? 'Nenhuma operação foi gerada. Verifique os dados do evento.'
          : `${count} operação${count > 1 ? 'es' : ''} gerada${count > 1 ? 's' : ''} com sucesso!`
      showSuccessToast(message)
    },
    onError: (error) => {
      showErrorToast(error)
    },
  })

  const isDisabled = !canDelegate || isPending

  return (
    <div className="relative group">
      <form action={formAction}>
        <input type="hidden" name="eventId" value={eventId} />
        <Button
          type="submit"
          disabled={isDisabled}
          variant="primary"
          title={!canDelegate ? disabledMessage : undefined}
        >
          {isPending ? 'Gerando...' : 'Gerar operações'}
        </Button>
      </form>

      {!canDelegate && disabledMessage && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {disabledMessage}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
        </div>
      )}
    </div>
  )
}
