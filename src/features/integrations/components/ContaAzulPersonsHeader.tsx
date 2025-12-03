'use client'

import { ROUTES } from '@/shared/config/constants'
import { useListFilters } from '@/shared/hooks/useListFilters'
import { IntegrationListHeader, ActiveFilter } from './IntegrationListHeader'
import { SyncButton } from './SyncButton'
import { syncContaAzulPersons } from '../actions/sync-contaazul-persons'
import {
  personTypeOptions,
  profileOptions,
  activeStatusOptions,
  getPersonTypeLabel,
  getProfileLabel,
  getActiveStatusLabel,
} from '../lib/persons-filter-helpers'

interface ContaAzulPersonsHeaderProps {
  count: number
}

export function ContaAzulPersonsHeader({ count }: ContaAzulPersonsHeaderProps) {
  const { filters, setFilters, applyFilters, clearFilters } = useListFilters({
    initialFilters: {
      search: '',
      person_type: '',
      profile: '',
      active: '',
    },
    basePath: ROUTES.INTEGRATIONS_CLIENTS,
  })

  const getCustomActiveFilters = (searchParams: URLSearchParams): ActiveFilter[] => {
    const customFilters: ActiveFilter[] = []

    const personType = searchParams.get('person_type')
    if (personType) {
      customFilters.push({
        key: 'person_type',
        label: 'Tipo',
        value: getPersonTypeLabel(personType),
      })
    }

    const profile = searchParams.get('profile')
    if (profile) {
      customFilters.push({
        key: 'profile',
        label: 'Perfil',
        value: getProfileLabel(profile),
      })
    }

    const active = searchParams.get('active')
    if (active) {
      customFilters.push({
        key: 'active',
        label: 'Status',
        value: getActiveStatusLabel(active),
      })
    }

    return customFilters
  }

  return (
    <IntegrationListHeader
      config={{
        title: 'Clientes - Conta Azul',
        singularLabel: 'cliente sincronizado',
        pluralLabel: 'clientes sincronizados',
        count,
        basePath: ROUTES.INTEGRATIONS_CLIENTS,
        searchPlaceholder: 'Nome, documento...',
        searchValue: filters.search,
        onSearchChange: (value) => setFilters((prev) => ({ ...prev, search: value })),
        syncButton: (
          <SyncButton
            syncAction={syncContaAzulPersons}
            label="Sincronizar Clientes"
            loadingLabel="Sincronizando..."
            successMessage="Clientes sincronizados com sucesso!"
          />
        ),
        customFilters: (
          <>
            <div className="flex-1">
              <label
                htmlFor="person_type"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Tipo
              </label>
              <select
                id="person_type"
                value={filters.person_type}
                onChange={(e) => setFilters((prev) => ({ ...prev, person_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {personTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label
                htmlFor="profile"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Perfil
              </label>
              <select
                id="profile"
                value={filters.profile}
                onChange={(e) => setFilters((prev) => ({ ...prev, profile: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {profileOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label
                htmlFor="active"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Status
              </label>
              <select
                id="active"
                value={filters.active}
                onChange={(e) => setFilters((prev) => ({ ...prev, active: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {activeStatusOptions.map((option) => (
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
