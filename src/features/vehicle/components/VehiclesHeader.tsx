'use client'

import { Modal } from '@/shared/ui'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { ListPageHeader } from '@/shared/ui/patterns/ListPageHeader'
import { ActionButton } from '@/shared/ui/patterns/ActionButton'
import { VehicleForm } from './VehicleForm'
import { ROUTES } from '@/shared/config'
import { usePermissions } from '@/features/auth/hooks/usePermissions'

interface VehiclesHeaderProps {
  count: number
}

export function VehiclesHeader({ count }: VehiclesHeaderProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { hasWritePermission } = usePermissions()

  const createAction = hasWritePermission ? (
    <>
      <ActionButton
        icon={PlusIcon}
        label="Novo veículo"
        onClick={() => setShowCreateModal(true)}
      />

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Novo veículo"
        size="lg"
      >
        <VehicleForm onSuccess={() => setShowCreateModal(false)} />
      </Modal>
    </>
  ) : undefined

  return (
    <ListPageHeader
      config={{
        title: 'Veículos',
        singularLabel: 'Veículo cadastrado',
        pluralLabel: 'Veículos cadastrados',
        count,
        basePath: ROUTES.VEHICLES,
        searchPlaceholder: 'Buscar por placa, marca ou modelo...',
        createAction,
      }}
    />
  )
}
