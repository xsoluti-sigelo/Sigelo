'use client'

import { useState } from 'react'
import type {
  OperationDisplay,
  DriverOption,
  VehicleOption,
} from '@/features/operations/model/types'
import type { ContaAzulServiceRecord as ContaAzulService } from '@/features/integrations/contaazul'
import { OperationsTable } from './OperationsTable'
import { OperationsHeader } from './OperationsHeader'

interface OperationsPageClientProps {
  operations: OperationDisplay[]
  currentPage: number
  totalPages: number
  count: number
  search?: string
  limit: number
  drivers: DriverOption[]
  vehicles: VehicleOption[]
  services: ContaAzulService[]
}

export function OperationsPageClient({
  operations,
  currentPage,
  totalPages,
  count,
  search,
  limit,
  drivers,
  vehicles,
  services,
}: OperationsPageClientProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  return (
    <>
      <OperationsHeader
        count={count}
        operations={operations}
        selectedIds={selectedIds}
        drivers={drivers}
        vehicles={vehicles}
        services={services}
      />

      <OperationsTable
        operations={operations}
        currentPage={currentPage}
        totalPages={totalPages}
        search={search}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        limit={limit}
        totalItems={count}
      />
    </>
  )
}
