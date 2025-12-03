interface OrderFulfillment {
  is_cancelled: boolean
  of_number: string
  of_items?: {
    quantity: number
    equipment_types?: {
      category: string | null
      name: string | null
    } | null
  }[]
}

interface OperationEquipmentProps {
  orderFulfillments?: OrderFulfillment[]
  source?: string | null
}

export function OperationEquipment({ orderFulfillments, source }: OperationEquipmentProps) {
  const equipmentTotals = orderFulfillments?.reduce(
    (totals: { standard: number; pcd: number; ofNumbersStd: string[]; ofNumbersPcd: string[] }, of) => {
      if (of.is_cancelled) return totals

      let hasStd = false
      let hasPcd = false

      of.of_items?.forEach((item) => {
        const category = item.equipment_types?.category
        const equipmentName = item.equipment_types?.name || ''

        const isPCD =
          category === 'BANHEIRO_PCD' ||
          (category === null && equipmentName.toUpperCase().includes('PCD'))

        if (isPCD) {
          totals.pcd += item.quantity
          hasPcd = true
        } else {
          totals.standard += item.quantity
          hasStd = true
        }
      })

      if (hasStd) totals.ofNumbersStd.push(of.of_number)
      if (hasPcd) totals.ofNumbersPcd.push(of.of_number)

      return totals
    },
    { standard: 0, pcd: 0, ofNumbersStd: [], ofNumbersPcd: [] },
  ) || { standard: 0, pcd: 0, ofNumbersStd: [], ofNumbersPcd: [] }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Banheiros Padrão
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {equipmentTotals.standard}
        </p>
        {equipmentTotals.ofNumbersStd.length > 0 && source !== 'MANUAL' && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            OF: {equipmentTotals.ofNumbersStd.join(', ')}
          </p>
        )}
      </div>
      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Banheiros PCD
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {equipmentTotals.pcd}
        </p>
        {equipmentTotals.ofNumbersPcd.length > 0 && source !== 'MANUAL' && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            OF: {equipmentTotals.ofNumbersPcd.join(', ')}
          </p>
        )}
      </div>
    </div>
  )
}
