'use client'

import { Button } from '../Button'
import { useRouter } from 'next/navigation'

interface FormActionsProps {
  submitLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  onCancel?: () => void
  cancelHref?: string
  submitDisabled?: boolean
}

export function FormActions({
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  onCancel,
  cancelHref,
  submitDisabled,
}: FormActionsProps) {
  const router = useRouter()

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else if (cancelHref) {
      router.push(cancelHref)
    } else {
      router.back()
    }
  }

  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
      <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
        {cancelLabel}
      </Button>
      <Button type="submit" isLoading={isLoading} disabled={submitDisabled}>
        {submitLabel}
      </Button>
    </div>
  )
}
