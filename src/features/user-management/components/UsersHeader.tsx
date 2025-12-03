'use client'

import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { ListPageHeader, ActiveFilter } from '@/shared/ui/patterns/ListPageHeader'
import { ActionButton } from '@/shared/ui/patterns/ActionButton'
import { FilterBuilder, createFilterFields } from '@/shared/ui/patterns/FilterBuilder'
import { useListFilters } from '@/shared/hooks/useListFilters'
import { getRoleLabel, getInviteStatusLabel, getUserStatusLabel } from '@/shared/lib/labels'
import { InviteModal } from '@/features/user-management'
import { ROUTES } from '@/shared/config'

interface UsersHeaderProps {
  totalCount: number
}

export function UsersHeader({ totalCount }: UsersHeaderProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const { filters, setFilters } = useListFilters({
    initialFilters: {
      search: '',
      status: '',
      role: '',
    },
    basePath: ROUTES.USERS,
  })

  const filterFields = createFilterFields(filters, setFilters, [
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'Todos os status' },
        { value: 'ACTIVE', label: 'Ativo' },
        { value: 'INACTIVE', label: 'Inativo' },
        { value: 'PENDING', label: 'Convite Pendente' },
        { value: 'EXPIRED', label: 'Convite Expirado' },
        { value: 'CANCELLED', label: 'Convite Cancelado' },
      ],
    },
    {
      name: 'role',
      label: 'Papel',
      type: 'select',
      options: [
        { value: '', label: 'Todos os papéis' },
        { value: 'ADMIN', label: 'Administrador' },
        { value: 'OPERATOR', label: 'Operador' },
        { value: 'VIEWER', label: 'Visualizador' },
      ],
    },
  ])

  const getCustomActiveFilters = (searchParams: URLSearchParams): ActiveFilter[] => {
    const customFilters: ActiveFilter[] = []

    const status = searchParams.get('status')
    if (status) {
      const label =
        status === 'ACTIVE' || status === 'INACTIVE'
          ? getUserStatusLabel(status)
          : getInviteStatusLabel(status)

      customFilters.push({
        key: 'status',
        label: 'Status',
        value: label,
      })
    }

    const role = searchParams.get('role')
    if (role) {
      customFilters.push({
        key: 'role',
        label: 'Papel',
        value: getRoleLabel(role),
      })
    }

    return customFilters
  }

  return (
    <div>
      <ListPageHeader
        config={{
          title: 'Gerenciamento de usuários',
          singularLabel: 'usuário encontrado',
          pluralLabel: 'usuários encontrados',
          count: totalCount,
          basePath: ROUTES.USERS,
          searchPlaceholder: 'Nome ou email...',
          createAction: (
            <ActionButton
              icon={PlusIcon}
              label="Convidar usuário"
              onClick={() => setIsInviteModalOpen(true)}
            />
          ),
          customFilters: <FilterBuilder fields={filterFields} />,
          getCustomActiveFilters,
        }}
      />

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  )
}
