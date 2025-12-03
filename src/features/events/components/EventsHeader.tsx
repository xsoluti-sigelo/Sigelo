'use client'

import { PlusIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { ListPageHeader, ActiveFilter } from '@/shared/ui/patterns/ListPageHeader'
import { ActionButton } from '@/shared/ui/patterns/ActionButton'
import { FilterBuilder, createFilterFields } from '@/shared/ui/patterns/FilterBuilder'
import { useListFilters } from '@/shared/hooks/useListFilters'
import { useUser } from '@/entities/user'
import { formatDate } from '@/shared/lib/formatters'
import { getEventStatusLabel, getEventTypeLabel } from '../lib/enum-mappers'
import { getEventStatusFilterOptions, getEventTypeFilterOptions } from '../lib/filter-helpers'
import { ROUTES } from '@/shared/config'

interface EventsHeaderProps {
  count: number
}

export function EventsHeader({ count }: EventsHeaderProps) {
  const router = useRouter()
  const { canWrite } = useUser()
  const { filters, setFilters, applyFilters, clearFilters } = useListFilters({
    initialFilters: {
      search: '',
      status: '',
      event_type: '',
      start_date: '',
      end_date: '',
    },
    basePath: ROUTES.EVENTS,
  })

  const filterFields = createFilterFields(filters, setFilters, [
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: getEventStatusFilterOptions(),
    },
    {
      name: 'event_type',
      label: 'Tipo',
      type: 'select',
      options: getEventTypeFilterOptions(),
    },
    {
      name: 'start_date',
      label: 'Data início (a partir de)',
      type: 'date',
    },
    {
      name: 'end_date',
      label: 'Data início (até)',
      type: 'date',
    },
  ])

  const getCustomActiveFilters = (searchParams: URLSearchParams): ActiveFilter[] => {
    const customFilters: ActiveFilter[] = []

    const status = searchParams.get('status')
    if (status) {
      customFilters.push({
        key: 'status',
        label: 'Status',
        value: getEventStatusLabel(status),
      })
    }

    const eventType = searchParams.get('event_type')
    if (eventType) {
      customFilters.push({
        key: 'event_type',
        label: 'Tipo',
        value: getEventTypeLabel(eventType),
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
    <ListPageHeader
      config={{
        title: 'Eventos',
        singularLabel: 'evento encontrado',
        pluralLabel: 'eventos encontrados',
        count,
        basePath: ROUTES.EVENTS,
        searchPlaceholder: 'Cliente, contrato...',
        searchValue: filters.search,
        onSearchChange: (value) => {
          setFilters((prev) => ({ ...prev, search: value }))
        },
        createAction: canWrite ? (
          <ActionButton
            icon={PlusIcon}
            label="Novo evento"
            onClick={() => router.push(ROUTES.EVENTS_CREATE)}
          />
        ) : undefined,
        customFilters: <FilterBuilder fields={filterFields} />,
        getCustomActiveFilters,
        onApplyFilters: applyFilters,
        onClearFilters: clearFilters,
      }}
    />
  )
}
