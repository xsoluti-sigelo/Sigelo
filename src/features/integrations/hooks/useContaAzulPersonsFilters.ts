'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ROUTES } from '@/shared/config/constants'
import { contaAzulPersonsFormatterService } from '../services'

interface FilterValue {
  key: string
  label: string
  value: string
}

const PROFILE_LABELS: Record<string, string> = {
  customer: 'Cliente',
  supplier: 'Fornecedor',
  accountant: 'Contador',
  partner: 'Sócio',
}

export function useContaAzulPersonsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [personType, setPersonType] = useState(searchParams.get('person_type') || '')
  const [profile, setProfile] = useState(searchParams.get('profile') || '')
  const [active, setActive] = useState(searchParams.get('active') || '')

  const buildActiveFilters = (): FilterValue[] => {
    const filters: FilterValue[] = []

    if (searchParams.get('search')) {
      filters.push({
        key: 'search',
        label: 'Busca',
        value: `"${searchParams.get('search')}"`,
      })
    }

    if (searchParams.get('person_type')) {
      filters.push({
        key: 'person_type',
        label: 'Tipo',
        value: contaAzulPersonsFormatterService.getPersonTypeLabel(searchParams.get('person_type')),
      })
    }

    if (searchParams.get('profile')) {
      const profileValue = searchParams.get('profile') || ''
      filters.push({
        key: 'profile',
        label: 'Perfil',
        value: PROFILE_LABELS[profileValue] || profileValue,
      })
    }

    if (searchParams.get('active')) {
      filters.push({
        key: 'active',
        label: 'Status',
        value: searchParams.get('active') === 'true' ? 'Ativo' : 'Inativo',
      })
    }

    return filters
  }

  const handleApplyFilters = (e: FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()

    if (searchInput) params.set('search', searchInput)
    if (personType) params.set('person_type', personType)
    if (profile) params.set('profile', profile)
    if (active) params.set('active', active)

    params.set('page', '1')

    router.push(`${ROUTES.INTEGRATIONS_CLIENTS}?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setPersonType('')
    setProfile('')
    setActive('')
    router.push(ROUTES.INTEGRATIONS_CLIENTS)
  }

  const handleRemoveFilter = (filterKey: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(filterKey)
    params.delete('page')

    if (filterKey === 'search') setSearchInput('')
    if (filterKey === 'person_type') setPersonType('')
    if (filterKey === 'profile') setProfile('')
    if (filterKey === 'active') setActive('')

    router.push(`${ROUTES.INTEGRATIONS_CLIENTS}?${params.toString()}`)
  }

  const activeFilters = buildActiveFilters()
  const hasActiveFilters = activeFilters.length > 0

  return {
    searchInput,
    personType,
    profile,
    active,
    setSearchInput,
    setPersonType,
    setProfile,
    setActive,
    handleApplyFilters,
    handleClearFilters,
    handleRemoveFilter,
    activeFilters,
    hasActiveFilters,
  }
}
