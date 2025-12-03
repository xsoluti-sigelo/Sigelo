'use client'

import type { Vehicle } from '../types'
import { DataTable, DataTableColumn } from '@/shared/ui/DataTable'
import { Pagination } from '@/shared/ui/Pagination'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { usePagination } from '@/shared/hooks'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { showSuccessToast, showErrorToast } from '@/shared/lib/toast'
import { FUEL_TYPE_LABELS } from '../lib'
import { deleteVehicleAction } from '../actions'
import { VehicleEditModal } from './VehicleEditModal'

interface VehiclesTableProps {
  vehicles: Vehicle[]
  currentPage: number
  totalPages: number
  search?: string
  totalItems?: number
  itemsPerPage?: number
}

export function VehiclesTable({ vehicles, currentPage, totalPages, search, totalItems, itemsPerPage }: VehiclesTableProps) {
  const router = useRouter()
  const { handlePageChange, handleItemsPerPageChange } = usePagination({ route: '/veiculos' })
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string
    plate: string
  } | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)

  const handleEditClick = (vehicle: Vehicle, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingVehicle(vehicle)
  }

  const handleCloseEditModal = () => {
    setEditingVehicle(null)
    router.refresh()
  }

  const handleDeleteClick = (vehicleId: string, vehiclePlate: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (isClosing) return
    setConfirmDelete({ id: vehicleId, plate: vehiclePlate })
  }

  const handleCloseDialog = () => {
    setIsClosing(true)
    setConfirmDelete(null)
    setTimeout(() => setIsClosing(false), 300)
  }

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return

    setDeletingId(confirmDelete.id)
    const result = await deleteVehicleAction(confirmDelete.id)
    setDeletingId(null)
    setConfirmDelete(null)

    if (result.success) {
      showSuccessToast('Veículo excluído com sucesso!')
      router.refresh()
    } else {
      showErrorToast(result.error || 'Erro ao excluir veículo')
    }
  }

  const formatLicensePlate = (plate: string) => {
    const cleaned = plate.replace(/[^A-Z0-9]/gi, '')

    if (cleaned.length === 7) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    }

    return plate
  }

  const columns: DataTableColumn<Vehicle>[] = [
    {
      header: 'Placa',
      className: 'min-w-[120px]',
      accessor: (row) => (
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors font-mono whitespace-nowrap">
          {formatLicensePlate(row.license_plate)}
        </div>
      ),
    },
    {
      header: 'Modelo',
      className: 'min-w-[150px]',
      accessor: (row) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">{row.model}</div>
      ),
    },
    {
      header: 'Marca',
      className: 'min-w-[120px]',
      accessor: (row) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">{row.brand}</div>
      ),
    },
    {
      header: 'Ano',
      className: 'min-w-[80px]',
      accessor: (row) => <div className="text-sm text-gray-500 dark:text-gray-400">{row.year}</div>,
    },
    {
      header: 'Capacidade',
      align: 'center',
      className: 'min-w-[100px]',
      accessor: (row) => (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center font-semibold">
          {row.module_capacity}
        </div>
      ),
    },
    {
      header: 'Tipo de combustível',
      className: 'min-w-[120px]',
      accessor: (row) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {row.fuel_type ? FUEL_TYPE_LABELS[row.fuel_type] : '-'}
        </div>
      ),
    },
    {
      header: 'Ações',
      align: 'right',
      className: 'min-w-[120px]',
      accessor: (row) => (
        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => handleEditClick(row, e)}
            className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center"
            title="Editar veículo"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => handleDeleteClick(row.id, row.license_plate, e)}
            disabled={deletingId === row.id}
            className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            title="Excluir veículo"
          >
            {deletingId === row.id ? (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <TrashIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <DataTable
        data={vehicles}
        columns={columns}
        onRowClick={(vehicle) => router.push(`/veiculos/${vehicle.id}`)}
        searchQuery={search}
        clearFiltersUrl="/veiculos"
        pagination={
          totalItems ? (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          ) : undefined
        }
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        title="Confirmar exclusão"
        message={
          confirmDelete
            ? `Tem certeza que deseja excluir o veículo ${confirmDelete.plate}? Esta ação não pode ser desfeita.`
            : ''
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={!!deletingId}
      />

      <VehicleEditModal
        isOpen={!!editingVehicle}
        onClose={handleCloseEditModal}
        vehicle={editingVehicle}
      />
    </>
  )
}
