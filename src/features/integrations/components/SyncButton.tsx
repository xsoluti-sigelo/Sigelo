'use client'

import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { ActionButton } from '@/shared/ui/patterns/ActionButton'
import { useSyncAction } from '../hooks/useSyncAction'

interface ActionResult {
  success: boolean
  message?: string
  error?: string
}

interface SyncButtonProps {
  syncAction: () => Promise<ActionResult>
  label: string
  loadingLabel?: string
  successMessage?: string
  errorMessage?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SyncButton({
  syncAction,
  label,
  loadingLabel,
  successMessage,
  errorMessage,
  className,
  size = 'md',
}: SyncButtonProps) {
  const { handleSync, isSyncing } = useSyncAction(syncAction, {
    successMessage,
    errorMessage,
  })

  return (
    <ActionButton
      icon={ArrowPathIcon}
      label={isSyncing ? loadingLabel || 'Sincronizando...' : label}
      onClick={handleSync}
      disabled={isSyncing}
      className={className}
      size={size}
      animateIcon={isSyncing}
    />
  )
}
