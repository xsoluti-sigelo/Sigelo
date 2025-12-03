import type { DriverOption, VehicleOption } from '@/features/operations/model/types'

interface AssignmentsFieldsProps {
  vehicleId: string
  partyId: string
  drivers: DriverOption[]
  vehicles: VehicleOption[]
  onVehicleChange: (value: string) => void
  onDriverChange: (value: string) => void
}

export function AssignmentsFields({
  vehicleId,
  partyId,
  drivers,
  vehicles,
  onVehicleChange,
  onDriverChange,
}: AssignmentsFieldsProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        Atribuições (opcional)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Veículo
          </label>
          <select
            value={vehicleId}
            onChange={(e) => onVehicleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Selecionar veículo...</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.license_plate} - {vehicle.brand} {vehicle.model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Motorista
          </label>
          <select
            value={partyId}
            onChange={(e) => onDriverChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Selecionar motorista...</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.display_name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
