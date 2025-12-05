'use client'

import { ArrowDownTrayIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { DriverOption, VehicleOption } from '@/features/operations/model/types'
import type { ContaAzulServiceRecord as ContaAzulService } from '@/features/integrations/contaazul'
import { exportOperationsToExcel } from '../../lib/export-operations'
import { fetchAllOperationsForExport, fetchOperationsByIds } from '../../api/actions/export-all-operations'
import { getOperationTypeLabel, OperationType, OperationTypeLabels, OperationStatus, OperationStatusLabels, getOperationStatusLabel } from '@/features/operations/config/operations-config'
import { formatDate } from '@/shared/lib/formatters'
import { CreateStandaloneOperationModal } from '../CreateStandaloneOperationModal'
import { ROUTES } from '@/shared/config'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { ListPageHeader, ActiveFilter } from '@/shared/ui/patterns/ListPageHeader'
import { ActionButton } from '@/shared/ui/patterns/ActionButton'
import { FilterBuilder, createFilterFields } from '@/shared/ui/patterns/FilterBuilder'
import { useListFilters } from '@/shared/hooks/useListFilters'

interface OperationsHeaderProps {
  count: number
  selectedIds: Set<string>
  drivers: DriverOption[]
  vehicles: VehicleOption[]
  services: ContaAzulService[]
}

export function OperationsHeader({
  count,
  selectedIds,
  drivers,
  vehicles,
  services,
}: OperationsHeaderProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const { hasWritePermission } = usePermissions()
  const searchParams = useSearchParams()

  const { filters, setFilters, applyFilters, clearFilters } = useListFilters({
    initialFilters: {
      search: '',
      event_search: '',
      of_search: '',
      operation_type: '',
      status: '',
      start_date: '',
      end_date: '',
    },
    basePath: ROUTES.OPERATIONS,
  })

  const handleExport = async () => {
    setIsExporting(true)
    try {
      if (selectedIds.size > 0) {
        const result = await fetchOperationsByIds(Array.from(selectedIds))
        if (result.success && result.data.length > 0) {
          exportOperationsToExcel(result.data)
        }
        return
      }

      const currentFilters = {
        search: searchParams.get('search') || '',
        event_search: searchParams.get('event_search') || '',
        of_search: searchParams.get('of_search') || '',
        operation_type: searchParams.get('operation_type') || '',
        status: searchParams.get('status') || '',
        start_date: searchParams.get('start_date') || '',
        end_date: searchParams.get('end_date') || '',
      }

      const result = await fetchAllOperationsForExport(currentFilters)
      if (result.success && result.data.length > 0) {
        exportOperationsToExcel(result.data)
      }
    } finally {
      setIsExporting(false)
    }
  }

  const filterFields = createFilterFields(filters, setFilters, [
    {
      name: 'event_search',
      label: 'Buscar por Evento',
      type: 'text',
      placeholder: 'Número ou título do evento...',
    },
    {
      name: 'of_search',
      label: 'Buscar por O.F',
      type: 'text',
      placeholder: 'Número da Ordem de Fornecimento...',
    },
    {
      name: 'operation_type',
      label: 'Tipo de Operação',
      type: 'select',
      options: [
        { value: '', label: 'Todos os tipos' },
        ...Object.values(OperationType).map((type) => ({
          value: type,
          label: OperationTypeLabels[type],
        })),
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'Todos os status' },
        ...Object.values(OperationStatus).map((status) => ({
          value: status,
          label: OperationStatusLabels[status],
        })),
      ],
    },
    {
      name: 'start_date',
      label: 'Data Inicial',
      type: 'date',
    },
    {
      name: 'end_date',
      label: 'Data Final',
      type: 'date',
    },
  ])

  const getCustomActiveFilters = (searchParams: URLSearchParams): ActiveFilter[] => {
    const customFilters: ActiveFilter[] = []

    const eventSearch = searchParams.get('event_search')
    if (eventSearch) {
      customFilters.push({
        key: 'event_search',
        label: 'Evento',
        value: `"${eventSearch}"`,
      })
    }

    const ofSearch = searchParams.get('of_search')
    if (ofSearch) {
      customFilters.push({
        key: 'of_search',
        label: 'O.F',
        value: `"${ofSearch}"`,
      })
    }

    const operationType = searchParams.get('operation_type')
    if (operationType) {
      customFilters.push({
        key: 'operation_type',
        label: 'Tipo',
        value: getOperationTypeLabel(operationType),
      })
    }

    const status = searchParams.get('status')
    if (status) {
      customFilters.push({
        key: 'status',
        label: 'Status',
        value: getOperationStatusLabel(status),
      })
    }

    const startDate = searchParams.get('start_date')
    if (startDate) {
      customFilters.push({
        key: 'start_date',
        label: 'A partir de',
        value: formatDate(startDate),
      })
    }

    const endDate = searchParams.get('end_date')
    if (endDate) {
      customFilters.push({
        key: 'end_date',
        label: 'Até',
        value: formatDate(endDate),
      })
    }

    return customFilters
  }

  return (
    <>
      <ListPageHeader
        config={{
          title: 'Operações',
          singularLabel: 'operação encontrada',
          pluralLabel: 'operações encontradas',
          count,
          basePath: ROUTES.OPERATIONS,
          searchPlaceholder: 'Buscar em todos os campos...',
          searchValue: filters.search,
          onSearchChange: (value) => {
            setFilters((prev) => ({ ...prev, search: value }))
          },
          showCreateButton: false,
          customFilters: <FilterBuilder fields={filterFields} />,
          getCustomActiveFilters,
          onApplyFilters: applyFilters,
          onClearFilters: clearFilters,
          customActions: (
            <>
              {hasWritePermission && (
                <ActionButton
                  icon={PlusIcon}
                  label="Nova operação"
                  onClick={() => setShowCreateModal(true)}
                  variant="outline"
                  title="Criar operação individual"
                />
              )}

              <ActionButton
                icon={ArrowDownTrayIcon}
                label={
                  isExporting ? (
                    'Exportando...'
                  ) : selectedIds.size > 0 ? (
                    <>
                      Exportar
                      <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">
                        {selectedIds.size}
                      </span>
                    </>
                  ) : (
                    'Exportar Tudo'
                  )
                }
                onClick={handleExport}
                variant="outline"
                title={selectedIds.size > 0 ? 'Exportar selecionados' : 'Exportar todas as páginas'}
                disabled={isExporting}
              />
            </>
          ),
        }}
      />

      <CreateStandaloneOperationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        drivers={drivers}
        vehicles={vehicles}
        services={services}
      />
    </>
  )
}
