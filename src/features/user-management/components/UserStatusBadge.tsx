'use client'

import { StatusBadge } from '@/shared/ui'
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import {
  getInviteStatusLabel,
  getInviteStatusVariant,
  getUserStatusVariant,
} from '@/shared/lib/labels'
import type { UserListItem } from '../types'

interface UserStatusBadgeProps {
  user: UserListItem
}

export function UserStatusBadge({ user }: UserStatusBadgeProps) {
  if (user.is_invite) {
    const status = user.invite_status || 'PENDING'
    return (
      <StatusBadge
        label={getInviteStatusLabel(status)}
        variant={getInviteStatusVariant(status)}
        icon={<EnvelopeIcon className="w-3.5 h-3.5" />}
      />
    )
  }

  const status = user.active ? 'ACTIVE' : 'INACTIVE'
  return (
    <StatusBadge
      label={status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
      variant={getUserStatusVariant(status)}
      icon={user.active ? <CheckCircleIcon className="w-3.5 h-3.5" /> : undefined}
    />
  )
}
