'use client'

import type { Vehicle } from '../types'
import { formatLicensePlate, getFuelTypeLabel } from '../lib'
import { Card, ConfirmDialog } from '@/shared/ui'
import { Pagination } from '@/shared/ui/Pagination'
import { TrashIcon } from '@heroicons/react/24/outline'
import { usePagination } from '@/shared/hooks'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { showSuccessToast, showErrorToast } from '@/shared/lib/toast'
import { deleteVehicleAction } from '@/features/vehicle'
import { VehiclesHeader } from './VehiclesHeader'
import Link from 'next/link'
import { ROUTES } from '@/shared/config'
import { usePermissions } from '@/features/auth/hooks/usePermissions'

interface VehicleListWidgetProps {
  vehicles: Vehicle[]
  currentPage: number
  totalPages: number
  count: number
  search?: string
  itemsPerPage?: number
}

export function VehicleListWidget({
  vehicles,
  currentPage,
  totalPages,
  count,
  search,
  itemsPerPage = 10,
}: VehicleListWidgetProps) {
  const router = useRouter()
  const { handlePageChange, handleItemsPerPageChange } = usePagination({ route: ROUTES.VEHICLES })
  const { hasWritePermission } = usePermissions()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string
    plate: string
  } | null>(null)
  const [isClosing, setIsClosing] = useState(false)

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

  return (
    <div className="space-y-6">
      <VehiclesHeader count={count} />

      {vehicles.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {search
                ? 'Nenhum veículo encontrado com os filtros aplicados.'
                : 'Nenhum veículo cadastrado ainda.'}
            </p>
            {search && (
              <Link
                href={ROUTES.VEHICLES}
                className="text-teal-600 dark:text-teal-400 hover:underline mt-2 inline-block"
              >
                Limpar filtros
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Placa
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Modelo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Marca
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Ano
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Módulos
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Combustível
                    </th>
{hasWritePermission && (
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Ações
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {vehicles.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-colors cursor-pointer group"
                      onClick={() => router.push(ROUTES.VEHICLE_DETAILS(vehicle.id))}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors font-mono">
                          {formatLicensePlate(vehicle.license_plate)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {vehicle.model}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {vehicle.brand}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {vehicle.year}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 text-center font-semibold">
                          {vehicle.module_capacity}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {getFuelTypeLabel(vehicle.fuel_type)}
                        </div>
                      </td>
{hasWritePermission && (
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={(e) => handleDeleteClick(vehicle.id, vehicle.license_plate, e)}
                              disabled={deletingId === vehicle.id}
                              className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                              title="Excluir veículo"
                            >
                              {deletingId === vehicle.id ? (
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
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={count}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        title="Excluir Veículo"
        message={`Tem certeza que deseja excluir o veículo "${confirmDelete?.plate}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={!!deletingId}
      />
    </div>
  )
}
