'use client'

import { DataTable, DataTableColumn } from '@/shared/ui/DataTable'
import { Pagination } from '@/shared/ui/Pagination'
import { usePagination } from '@/shared/hooks'
import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { showSuccessToast, showErrorToast } from '@/shared/lib/toast'
import { updateUserRole } from '../actions'
import { useUser } from '@/entities/user'
import type { UserListItem } from '../types'
import { formatDate, formatDateTime } from '@/shared/lib/formatters'
import { getRoleLabel } from '@/shared/lib/labels'
import { UserAvatar } from './UserAvatar'
import { UserStatusBadge } from './UserStatusBadge'
import { UserRoleEditor } from './UserRoleEditor'
import { InviteActions } from './InviteActions'

interface UsersTableProps {
  users: UserListItem[]
  currentPage: number
  totalPages: number
  totalItems?: number
  itemsPerPage?: number
}

export function UsersTable({ users, currentPage, totalPages, totalItems, itemsPerPage }: UsersTableProps) {
  const router = useRouter()
  const { handlePageChange, handleItemsPerPageChange } = usePagination({ route: '/usuarios' })
  const [isPending, startTransition] = useTransition()
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [newRole, setNewRole] = useState<'ADMIN' | 'OPERATOR' | 'VIEWER'>('OPERATOR')
  const currentUser = useUser()

  const handleEditRole = (userId: string, currentRole: string) => {
    setEditingUserId(userId)
    setNewRole(currentRole as 'ADMIN' | 'OPERATOR' | 'VIEWER')
  }

  const handleSaveRole = (userId: string) => {
    startTransition(async () => {
      const result = await updateUserRole({ userId, newRole })
      if (result.success) {
        showSuccessToast('Permissão atualizada com sucesso!')
        setEditingUserId(null)
        router.refresh()
      } else {
        showErrorToast(result.error || 'Erro ao atualizar permissão')
      }
    })
  }

  const formatLastLogin = (dateString: string | null) => {
    if (!dateString) return 'Nunca'
    return formatDateTime(dateString)
  }

  const columns: DataTableColumn<UserListItem>[] = [
    {
      header: 'Usuário',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar pictureUrl={row.picture_url} fullName={row.full_name} />
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {row.full_name}
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: (row) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">{row.email}</div>
      ),
    },
    {
      header: 'Papel',
      accessor: (row) => {
        if (row.is_invite) {
          return (
            <div className="text-sm text-gray-600 dark:text-gray-400">{getRoleLabel(row.role)}</div>
          )
        }

        if (currentUser.userId && row.id === currentUser.userId) {
          return (
            <div className="text-sm text-gray-600 dark:text-gray-400">{getRoleLabel(row.role)}</div>
          )
        }

        return (
          <UserRoleEditor
            userId={row.id}
            currentRole={row.role}
            isEditing={editingUserId === row.id}
            newRole={newRole}
            isPending={isPending}
            onEdit={handleEditRole}
            onSave={handleSaveRole}
            onCancel={() => setEditingUserId(null)}
            onRoleChange={setNewRole}
          />
        )
      },
    },
    {
      header: 'Status',
      accessor: (row) => <UserStatusBadge user={row} />,
    },
    {
      header: 'Último Acesso',
      accessor: (row) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {row.is_invite
            ? row.invite_expires_at
              ? `Expira: ${formatDate(row.invite_expires_at)}`
              : '-'
            : formatLastLogin(row.last_login_at)}
        </div>
      ),
    },
    {
      header: '',
      accessor: (row) => {
        if (row.is_invite && row.invite_id) {
          return <InviteActions inviteId={row.invite_id} inviteStatus={row.invite_status} />
        }
        return null
      },
    },
  ]

  return (
    <DataTable
      data={users}
      columns={columns}
      emptyState={{
        title: 'Nenhum usuário encontrado',
      }}
      pagination={
        totalItems ? (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        ) : undefined
      }
    />
  )
}
