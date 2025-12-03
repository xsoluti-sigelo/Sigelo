'use client'

import { ROUTES } from '@/shared/config/constants'
import { useListFilters } from '@/shared/hooks/useListFilters'
import { IntegrationListHeader, ActiveFilter } from './IntegrationListHeader'
import { SyncButton } from './SyncButton'
import { syncContaAzulServices } from '../actions/sync-services'
import { getRelativeTime } from '../lib/date-utils'
import {
  costFilterOptions,
  priceFilterOptions,
  getCostFilterLabel,
  getPriceFilterLabel,
} from '../lib/services-filter-helpers'

interface ServicesHeaderProps {
  count: number
  lastSyncedAt: string | null
}

export function ServicesHeader({ count, lastSyncedAt }: ServicesHeaderProps) {
  const { filters, setFilters, applyFilters, clearFilters } = useListFilters({
    initialFilters: {
      search: '',
      cost_filter: '',
      price_filter: '',
    },
    basePath: ROUTES.INTEGRATIONS_SERVICES,
  })

  const getCustomActiveFilters = (searchParams: URLSearchParams): ActiveFilter[] => {
    const customFilters: ActiveFilter[] = []

    const costFilter = searchParams.get('cost_filter')
    if (costFilter) {
      customFilters.push({
        key: 'cost_filter',
        label: 'Custo',
        value: getCostFilterLabel(costFilter),
      })
    }

    const priceFilter = searchParams.get('price_filter')
    if (priceFilter) {
      customFilters.push({
        key: 'price_filter',
        label: 'Preço',
        value: getPriceFilterLabel(priceFilter),
      })
    }

    return customFilters
  }

  return (
    <IntegrationListHeader
      config={{
        title: 'Serviços do Conta Azul',
        singularLabel: 'serviço sincronizado',
        pluralLabel: 'serviços sincronizados',
        count,
        basePath: ROUTES.INTEGRATIONS_SERVICES,
        searchPlaceholder: 'Nome ou ID do serviço',
        searchValue: filters.search,
        onSearchChange: (value) => setFilters((prev) => ({ ...prev, search: value })),
        metadata: (
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Última sincronização: {getRelativeTime(lastSyncedAt)}
          </p>
        ),
        syncButton: (
          <SyncButton
            syncAction={syncContaAzulServices}
            label="Sincronizar Serviços"
            loadingLabel="Sincronizando..."
            successMessage="Serviços sincronizados com sucesso!"
          />
        ),
        customFilters: (
          <>
            <div>
              <label
                htmlFor="cost_filter"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Filtro de custo
              </label>
              <select
                id="cost_filter"
                value={filters.cost_filter}
                onChange={(e) => setFilters((prev) => ({ ...prev, cost_filter: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {costFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="price_filter"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Filtro de preço
              </label>
              <select
                id="price_filter"
                value={filters.price_filter}
                onChange={(e) => setFilters((prev) => ({ ...prev, price_filter: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {priceFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        ),
        getCustomActiveFilters,
        onApplyFilters: applyFilters,
        onClearFilters: clearFilters,
      }}
    />
  )
}
