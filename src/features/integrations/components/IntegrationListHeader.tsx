'use client'

import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import {
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, ReactNode } from 'react'
import { FILTERS } from '../lib/constants'

export interface ActiveFilter {
  key: string
  label: string
  value: string
}

export interface IntegrationListHeaderConfig {
  title: string
  singularLabel: string
  pluralLabel: string
  count: number
  basePath: string
  searchPlaceholder: string
  metadata?: ReactNode
  syncButton?: ReactNode
  customFilters?: ReactNode
  getCustomActiveFilters?: (searchParams: URLSearchParams) => ActiveFilter[]
  onApplyFilters?: (e: React.FormEvent) => void
  onClearFilters?: () => void
  searchValue?: string
  onSearchChange?: (value: string) => void
}

interface IntegrationListHeaderProps {
  config: IntegrationListHeaderConfig
}

export function IntegrationListHeader({ config }: IntegrationListHeaderProps) {
  const {
    title,
    singularLabel,
    pluralLabel,
    count,
    basePath,
    searchPlaceholder,
    metadata,
    syncButton,
    customFilters,
    getCustomActiveFilters,
    onApplyFilters,
    onClearFilters,
    searchValue,
    onSearchChange,
  } = config

  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(
    searchValue !== undefined ? searchValue : searchParams.get('search') || '',
  )

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (onApplyFilters) {
      onApplyFilters(e)
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    if (searchInput.trim()) {
      params.set('search', searchInput.trim())
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`${basePath}?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setSearchInput('')
    if (onSearchChange) {
      onSearchChange('')
    }
    if (onClearFilters) {
      onClearFilters()
    } else {
      router.push(basePath)
    }
  }

  const handleRemoveFilter = (filterKey: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(filterKey)
    params.delete('page')

    if (filterKey === 'search') {
      setSearchInput('')
      if (onSearchChange) {
        onSearchChange('')
      }
    }

    const queryString = params.toString()
    router.push(queryString ? `${basePath}?${queryString}` : basePath)
  }

  const getActiveFilters = (): ActiveFilter[] => {
    const filters: ActiveFilter[] = []

    const search = searchParams.get('search')
    if (search) {
      filters.push({ key: 'search', label: 'Busca', value: `"${search}"` })
    }

    if (getCustomActiveFilters) {
      const customActiveFilters = getCustomActiveFilters(searchParams)
      filters.push(...customActiveFilters)
    }

    return filters
  }

  const activeFilters = getActiveFilters()
  const hasActiveFilters = activeFilters.length > 0
  const activeFiltersCount = activeFilters.length

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h1>

          <div className="flex flex-col gap-1">
            <p className="text-gray-600 dark:text-gray-400">
              {count} {count === 1 ? singularLabel : pluralLabel}
            </p>
            {metadata}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-end">
          {syncButton}

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isPending}
            title="Atualizar lista"
            aria-label="Atualizar lista"
          >
            <ArrowPathIcon
              className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
          </Button>

          <Button
            variant={showFilters ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            title="Filtros"
            aria-label={showFilters ? 'Fechar filtros' : 'Abrir filtros'}
            aria-expanded={showFilters}
            aria-controls="filters-panel"
          >
            <FunnelIcon className="w-4 h-4" aria-hidden="true" />
            {hasActiveFilters && activeFiltersCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-white/20">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {hasActiveFilters && !showFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Filtros ativos:
          </span>

          {activeFilters.map((filter) => (
            <div
              key={filter.key}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-lg border border-teal-100 dark:border-teal-800"
            >
              <span className="font-medium">{filter.label}:</span>
              <span>{filter.value}</span>
              <button
                type="button"
                onClick={() => handleRemoveFilter(filter.key)}
                className="p-0.5 hover:bg-teal-100 dark:hover:bg-teal-900/40 rounded transition-colors"
                title={`Remover filtro ${filter.label}`}
                aria-label={`Remover filtro ${filter.label}`}
              >
                <XMarkIcon
                  className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400"
                  aria-hidden="true"
                />
              </button>
            </div>
          ))}

          {activeFiltersCount > FILTERS.MAX_VISIBLE_FILTERS_BEFORE_COLLAPSE && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800"
            >
              Limpar todos
            </button>
          )}
        </div>
      )}

      {showFilters && (
        <div
          id="filters-panel"
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filtros</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                <XMarkIcon className="w-4 h-4 mr-1" />
                Limpar filtros
              </Button>
            )}
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Buscar
                </label>
                <div className="relative">
                  <Input
                    id="search"
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchInput}
                    onChange={(e) => {
                      const newValue = e.target.value
                      setSearchInput(newValue)
                      if (onSearchChange) {
                        onSearchChange(newValue)
                      }
                    }}
                    className="pl-10"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {customFilters}
            </div>

            <div className="flex gap-3">
              <Button type="submit">Aplicar filtros</Button>
              <Button type="button" variant="outline" onClick={() => setShowFilters(false)}>
                Fechar
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
