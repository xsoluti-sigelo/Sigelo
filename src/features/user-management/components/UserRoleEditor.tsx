'use client'

import { Button } from '@/shared/ui'
import { CheckIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { getRoleLabel } from '@/shared/lib/labels'

interface UserRoleEditorProps {
  userId: string
  currentRole: string
  isEditing: boolean
  newRole: 'ADMIN' | 'OPERATOR' | 'VIEWER'
  isPending: boolean
  onEdit: (userId: string, currentRole: string) => void
  onSave: (userId: string) => void
  onCancel: () => void
  onRoleChange: (role: 'ADMIN' | 'OPERATOR' | 'VIEWER') => void
}

export function UserRoleEditor({
  userId,
  currentRole,
  isEditing,
  newRole,
  isPending,
  onEdit,
  onSave,
  onCancel,
  onRoleChange,
}: UserRoleEditorProps) {
  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <select
          value={newRole}
          onChange={(e) => onRoleChange(e.target.value as 'ADMIN' | 'OPERATOR' | 'VIEWER')}
          className="text-sm px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="ADMIN">{getRoleLabel('ADMIN')}</option>
          <option value="OPERATOR">{getRoleLabel('OPERATOR')}</option>
          <option value="VIEWER">{getRoleLabel('VIEWER')}</option>
        </select>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSave(userId)}
          disabled={isPending}
          title="Salvar alterações"
        >
          <CheckIcon className="w-4 h-4 text-green-600" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isPending} title="Cancelar">
          <XMarkIcon className="w-4 h-4 text-gray-600" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm text-gray-600 dark:text-gray-400">{getRoleLabel(currentRole)}</div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(userId, currentRole)}
        disabled={isPending}
        title="Editar permissões"
      >
        <PencilIcon className="w-4 h-4" />
      </Button>
    </div>
  )
}
