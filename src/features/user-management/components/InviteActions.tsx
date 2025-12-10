'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Send, Trash2, Loader2 } from 'lucide-react'
import { showSuccessToast, showErrorToast } from '@/shared/lib/toast'
import { resendInvite, cancelInvite } from '../actions'

interface InviteActionsProps {
  inviteId: string
  inviteStatus?: string
}

export function InviteActions({ inviteId, inviteStatus }: InviteActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const canResend = inviteStatus === 'PENDING' || inviteStatus === 'EXPIRED'
  const canCancel = inviteStatus === 'PENDING'

  const handleResend = () => {
    setIsMenuOpen(false)
    startTransition(async () => {
      const result = await resendInvite({ inviteId })
      if (result.success) {
        showSuccessToast('Convite reenviado com sucesso!')
        router.refresh()
      } else {
        showErrorToast(result.error || 'Erro ao reenviar convite')
      }
    })
  }

  const handleCancel = () => {
    setIsMenuOpen(false)
    startTransition(async () => {
      const result = await cancelInvite({ inviteId })
      if (result.success) {
        showSuccessToast('Convite cancelado com sucesso!')
        router.refresh()
      } else {
        showErrorToast(result.error || 'Erro ao cancelar convite')
      }
    })
  }

  if (!canResend && !canCancel) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => !isPending && setIsMenuOpen(!isMenuOpen)}
        disabled={isPending}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
        ) : (
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {isMenuOpen && !isPending && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
            {canResend && (
              <button
                onClick={handleResend}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Send className="w-4 h-4" />
                Reenviar convite
              </button>
            )}
            {canCancel && (
              <button
                onClick={handleCancel}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Trash2 className="w-4 h-4" />
                Cancelar convite
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
