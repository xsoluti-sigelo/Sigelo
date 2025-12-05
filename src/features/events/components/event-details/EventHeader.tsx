'use client'

import type { EventInvoice, DelegationStatus } from '../../model'
import { Button } from '@/shared/ui'
import { PencilIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { GenerateOperationsButton } from '../GenerateOperationsButton'
import { getEventStatusLabel, getStatusColor } from '../../lib/enum-mappers'
import { ROUTES } from '@/shared/config'
import { usePermissions } from '@/features/auth/hooks/usePermissions'

interface EventHeaderProps {
  eventId: string
  contractName: string
  contractNumber: string
  status: string
  invoice?: EventInvoice | null
  delegationStatus: DelegationStatus
}

export function EventHeader({
  eventId,
  contractName,
  contractNumber,
  status,
  invoice,
  delegationStatus,
}: EventHeaderProps) {
  const { hasWritePermission } = usePermissions()

  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{contractName}</h1>
          <span
            className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              status,
            )}`}
          >
            {getEventStatusLabel(status)}
          </span>
          {invoice && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800">
              <DocumentDuplicateIcon className="w-4 h-4" />
              <span>Fatura #{invoice.invoice_number}</span>
            </span>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-mono">{contractNumber}</p>
      </div>
      {hasWritePermission && (
        <div className="flex items-center gap-3">
          <div className="relative">
            <GenerateOperationsButton
              eventId={eventId}
              canDelegate={delegationStatus.canDelegate}
              disabledMessage={delegationStatus.warningMessage}
            />
            {delegationStatus.executedOperations > 0 &&
              delegationStatus.canDelegate &&
              delegationStatus.delegationMode !== 'completed' && (
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-orange-100 bg-orange-600 rounded-full">
                  {delegationStatus.executedOperations} exec.
                </span>
              )}
          </div>

          <Link href={ROUTES.EVENT_EDIT(eventId)}>
            <Button variant="outline">
              <PencilIcon className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
