import { Input } from '@/shared/ui'
import { OperationType, OperationTypeLabels } from '@/features/operations/config/operations-config'

interface OperationFieldsProps {
  date: string
  time: string
  type: OperationType
  onDateChange: (value: string) => void
  onTimeChange: (value: string) => void
  onTypeChange: (value: OperationType) => void
}

export function OperationFields({
  date,
  time,
  type,
  onDateChange,
  onTimeChange,
  onTypeChange,
}: OperationFieldsProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        Detalhes da operação
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Data <span className="text-red-500">*</span>
          </label>
          <Input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Horário <span className="text-red-500">*</span>
          </label>
          <Input type="time" value={time} onChange={(e) => onTimeChange(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de operação <span className="text-red-500">*</span>
          </label>
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value as OperationType)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            {Object.values(OperationType).map((operationType) => (
              <option key={operationType} value={operationType}>
                {OperationTypeLabels[operationType]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
