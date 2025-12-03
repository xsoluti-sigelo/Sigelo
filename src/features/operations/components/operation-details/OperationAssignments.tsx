'use client'

import { useState } from 'react'
import { Button } from '@/shared/ui'
import { UserIcon, TruckIcon } from '@heroicons/react/24/outline'
import type { DriverOption, VehicleOption, AssignmentResponse } from '@/features/operations/model/types'

interface OperationAssignmentsProps {
  drivers: DriverOption[]
  vehicles: VehicleOption[]
  currentAssignments: AssignmentResponse
  isPending: boolean
  onAssignDriver: (driverId: string) => void
  onRemoveDriver: (assignmentId: string) => void
  onAssignVehicle: (vehicleId: string) => void
  onRemoveVehicle: (assignmentId: string) => void
  canEdit: boolean
}

export function OperationAssignments({
  drivers,
  vehicles,
  currentAssignments,
  isPending,
  onAssignDriver,
  onRemoveDriver,
  onAssignVehicle,
  onRemoveVehicle,
  canEdit,
}: OperationAssignmentsProps) {
  const [selectedDriver, setSelectedDriver] = useState<string>(
    currentAssignments.serviceAssignments.length > 0
      ? currentAssignments.serviceAssignments[0].party_id
      : '',
  )
  const [selectedVehicle, setSelectedVehicle] = useState<string>(
    currentAssignments.vehicleAssignment ? currentAssignments.vehicleAssignment.vehicle_id : '',
  )

  const handleAssignDriver = () => {
    if (selectedDriver) {
      onAssignDriver(selectedDriver)
    }
  }

  const handleAssignVehicle = () => {
    if (selectedVehicle) {
      onAssignVehicle(selectedVehicle)
    }
  }

  return (
    <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recursos alocados</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Motorista */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Motorista</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {currentAssignments.serviceAssignments.length > 0
                  ? currentAssignments.serviceAssignments[0].parties?.display_name || 'Não atribuído'
                  : 'Não atribuído'}
              </p>
            </div>
          </div>
          {canEdit && (
            currentAssignments.serviceAssignments.length > 0 ? (
              <button
                onClick={() => onRemoveDriver(currentAssignments.serviceAssignments[0].id)}
                className="w-full py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition-colors font-medium"
              >
                Remover
              </button>
            ) : (
              <div className="space-y-2">
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-xs"
                >
                  <option value="">Selecionar...</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.display_name}
                    </option>
                  ))}
                </select>
                <Button onClick={handleAssignDriver} isLoading={isPending} className="w-full" size="sm">
                  Atribuir
                </Button>
              </div>
            )
          )}
        </div>

        <div className="h-px bg-gray-200 dark:bg-gray-800" />

        {/* Veículo */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              <TruckIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Veículo</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {currentAssignments.vehicleAssignment
                  ? currentAssignments.vehicleAssignment.vehicles?.license_plate || 'Não atribuído'
                  : 'Não atribuído'}
              </p>
              {currentAssignments.vehicleAssignment?.vehicles && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {currentAssignments.vehicleAssignment.vehicles.brand}{' '}
                  {currentAssignments.vehicleAssignment.vehicles.model}
                </p>
              )}
            </div>
          </div>
          {canEdit && (
            currentAssignments.vehicleAssignment ? (
              <button
                onClick={() => onRemoveVehicle(currentAssignments.vehicleAssignment!.id)}
                className="w-full py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition-colors font-medium"
              >
                Remover
              </button>
            ) : (
              <div className="space-y-2">
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-xs"
                >
                  <option value="">Selecionar...</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.license_plate} - {vehicle.brand} {vehicle.model}
                    </option>
                  ))}
                </select>
                <Button onClick={handleAssignVehicle} isLoading={isPending} className="w-full" size="sm">
                  Atribuir
                </Button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
