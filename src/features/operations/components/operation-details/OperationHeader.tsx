'use client'

import { useState } from 'react'
import { Breadcrumb, Button } from '@/shared/ui'
import {
  OperationTypeLabels,
  OperationStatus,
  OperationStatusLabels,
} from '@/features/operations/config/operations-config'
import { ROUTES } from '@/shared/config'
import {
  CalendarIcon,
  ClockIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface OperationHeaderProps {
  operation: {
    id: string
    type: string
    date: string | null
    time: string | null
    status: OperationStatus | null
    events?: {
      id: string
      name?: string | null
      contaazul_pessoas?: { name?: string } | null
    } | null
  }
  isPending: boolean
  onSave: (status: OperationStatus, date: string, time: string) => void
  canEdit: boolean
}

export function OperationHeader({ operation, isPending, onSave, canEdit }: OperationHeaderProps) {
  const [status, setStatus] = useState<OperationStatus>(operation.status || OperationStatus.SCHEDULED)
  const [operationDate, setOperationDate] = useState<string>(operation.date || '')
  const [operationTime, setOperationTime] = useState<string>(operation.time || '')
  const [isEditingDateTime, setIsEditingDateTime] = useState(false)

  const handleSave = () => {
    onSave(status, operationDate, operationTime)
    setIsEditingDateTime(false)
  }

  const handleCancelEdit = () => {
    setOperationDate(operation.date || '')
    setOperationTime(operation.time || '')
    setIsEditingDateTime(false)
  }

  return (
    <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800">
      <Breadcrumb
        items={[
          { label: 'Operações', href: ROUTES.OPERATIONS },
          { label: OperationTypeLabels[operation.type as keyof typeof OperationTypeLabels] },
        ]}
        className="mb-4"
      />

      <div className="flex flex-wrap items-center gap-4 mb-4">
        {isEditingDateTime ? (
          <>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <input
                type="date"
                value={operationDate}
                onChange={(e) => setOperationDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <input
                type="time"
                value={operationTime}
                onChange={(e) => setOperationTime(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
              title="Salvar"
            >
              <CheckIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isPending}
              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
              title="Cancelar"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-900 dark:text-white">
                {operationDate
                  ? new Date(operationDate + 'T00:00:00').toLocaleDateString('pt-BR')
                  : '--/--/----'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-900 dark:text-white">
                {operationTime ? operationTime.slice(0, 5) : '--:--'}
              </span>
            </div>
{canEdit && (
              <button
                onClick={() => setIsEditingDateTime(true)}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Editar data e horário"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            )}
          </>
        )}
        {operation.events?.name && (
          <>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
            <Link
              href={ROUTES.EVENT_DETAILS(operation.events.id)}
              className="text-teal-600 dark:text-teal-400 hover:underline text-sm"
            >
              {operation.events.name}
            </Link>
          </>
        )}
        {operation.events?.contaazul_pessoas && (
          <>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {(operation.events.contaazul_pessoas as { name?: string })?.name}
            </span>
          </>
        )}
      </div>

{canEdit && (
        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OperationStatus)}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value={OperationStatus.SCHEDULED}>
              {OperationStatusLabels[OperationStatus.SCHEDULED]}
            </option>
            <option value={OperationStatus.RECEIVED}>
              {OperationStatusLabels[OperationStatus.RECEIVED]}
            </option>
            <option value={OperationStatus.VERIFIED}>
              {OperationStatusLabels[OperationStatus.VERIFIED]}
            </option>
            <option value={OperationStatus.IN_PROGRESS}>
              {OperationStatusLabels[OperationStatus.IN_PROGRESS]}
            </option>
            <option value={OperationStatus.COMPLETED}>
              {OperationStatusLabels[OperationStatus.COMPLETED]}
            </option>
            <option value={OperationStatus.CANCELLED}>
              {OperationStatusLabels[OperationStatus.CANCELLED]}
            </option>
            <option value={OperationStatus.INCOMPLETE}>
              {OperationStatusLabels[OperationStatus.INCOMPLETE]}
            </option>
            <option value={OperationStatus.TIME_ERROR}>
              {OperationStatusLabels[OperationStatus.TIME_ERROR]}
            </option>
            <option value={OperationStatus.NOT_FULFILLED}>
              {OperationStatusLabels[OperationStatus.NOT_FULFILLED]}
            </option>
          </select>
          <Button onClick={handleSave} isLoading={isPending} size="sm">
            Salvar Alterações
          </Button>
        </div>
      )}
    </div>
  )
}
