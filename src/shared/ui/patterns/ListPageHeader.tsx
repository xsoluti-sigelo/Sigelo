'use client'

import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import {
  PlusIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useEffect, ReactNode } from 'react'
import { showListUpdatedToast } from '@/shared/lib/toast'

export interface ActiveFilter {
  key: string

  label: string

  value: string
}

export interface ListPageHeaderConfig {
  title: string

  singularLabel: string

  pluralLabel: string

  count: number

  basePath: string

  searchPlaceholder: string

  searchValue?: string

  onSearchChange?: (value: string) => void

  createAction?: ReactNode

  createLabel?: string

  showCreateButton?: boolean

  customFilters?: ReactNode

  getCustomActiveFilters?: (searchParams: URLSearchParams) => ActiveFilter[]

  onApplyFilters?: (e: React.FormEvent) => void

  onClearFilters?: () => void

  metadata?: ReactNode

  customActions?: ReactNode

  canWrite?: boolean
}

interface ListPageHeaderProps {
  config: ListPageHeaderConfig
}

export function ListPageHeader({ config }: ListPageHeaderProps) {
  const {
    title,
    singularLabel,
    pluralLabel,
    count,
    basePath,
    searchPlaceholder,
    searchValue,
    onSearchChange,
    createAction,
    createLabel = `Novo ${title.slice(0, -1)}`,
    showCreateButton = true,
    customFilters,
    getCustomActiveFilters,
    onApplyFilters,
    onClearFilters,
    metadata,
    customActions,
    canWrite = true,
  } = config

  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(
    searchValue !== undefined ? searchValue : searchParams.get('search') || '',
  )
  const [wasRefreshing, setWasRefreshing] = useState(false)

  useEffect(() => {
    if (searchValue !== undefined && searchValue !== searchInput) {
      setSearchInput(searchValue)
    }
  }, [searchValue, searchInput])

  useEffect(() => {
    if (wasRefreshing && !isPending) {
      showListUpdatedToast()
      setWasRefreshing(false)
    }
  }, [isPending, wasRefreshing])

  const handleRefresh = () => {
    setWasRefreshing(true)
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
    if (searchInput) {
      params.set('search', searchInput)
    } else {
      params.delete('search')
    }
    params.delete('page')
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

    router.push(`${basePath}?${params.toString()}`)
  }

  const getActiveFilters = (): ActiveFilter[] => {
    const filters: ActiveFilter[] = []

    const search = searchParams.get('search')
    if (search) {
      filters.push({ key: 'search', label: 'Busca', value: `"${search}"` })
    }

    if (getCustomActiveFilters) {
      const customFilters = getCustomActiveFilters(searchParams)
      filters.push(...customFilters)
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
          <p className="text-gray-600 dark:text-gray-400">
            {count} {count === 1 ? singularLabel : pluralLabel}
          </p>
          {metadata && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{metadata}</div>
          )}
        </div>

        <div className="flex gap-3 items-center">
          {canWrite &&
            showCreateButton &&
            (createAction || (
              <a href={`${basePath}/novo`}>
                <Button>
                  <PlusIcon className="w-5 h-5 mr-2" />
                  {createLabel}
                </Button>
              </a>
            ))}
          {customActions && <div className="flex items-center gap-2">{customActions}</div>}
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isPending}
            title="Atualizar lista"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isPending ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant={showFilters ? 'primary' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            title="Filtros"
          >
            <FunnelIcon className="w-5 h-5" />
            {hasActiveFilters && activeFiltersCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-white/20">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {hasActiveFilters && !showFilters && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Filtros ativos:
          </span>

          {activeFilters.map((filter) => (
            <div
              key={filter.key}
              className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg text-sm group"
            >
              <span className="text-xs font-medium text-teal-700 dark:text-teal-300">
                {filter.label}:
              </span>
              <span className="font-semibold text-teal-800 dark:text-teal-200">{filter.value}</span>
              <button
                onClick={() => handleRemoveFilter(filter.key)}
                className="ml-1 p-0.5 hover:bg-teal-100 dark:hover:bg-teal-900/40 rounded transition-colors"
                title={`Remover filtro ${filter.label}`}
              >
                <XMarkIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              </button>
            </div>
          ))}

          {activeFiltersCount > 2 && (
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
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm mb-4">
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
            <div className="flex items-end gap-3">
              <div className="flex-1 max-w-md">
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
              <Button type="submit">Aplicar Filtros</Button>
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
