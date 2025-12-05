import { OperationTypeLabels, OperationStatusLabels } from '@/features/operations/config/operations-config'
import type { OperationDisplay } from '@/features/operations/model/types'
import * as XLSX from 'xlsx'

export function exportOperationsToExcel(operations: OperationDisplay[]) {
  try {
    const headers = [
      'Data',
      'Hora',
      'Tipo de Operação',
      'Status',
      'Descrição do Evento',
      'Cliente',
      'Endereço',
      'Equip. STD',
      'Equip. PCD',
      'Veículo',
      'Motorista',
      'Produtor Responsável',
      'Telefone do Produtor',
      'Instruções',
    ]

    const rows = operations.map((operation) => {
      // Build instructions text with STD/PCD quantities and O.F. numbers
      const instructionsParts: string[] = []
      if ((operation.equipment_std || 0) > 0) {
        const ofStd = operation.of_number_std ? ` - OF ${operation.of_number_std}` : ''
        instructionsParts.push(`STD: ${operation.equipment_std}${ofStd}`)
      }
      if ((operation.equipment_pcd || 0) > 0) {
        const ofPcd = operation.of_number_pcd ? ` - OF ${operation.of_number_pcd}` : ''
        instructionsParts.push(`PCD: ${operation.equipment_pcd}${ofPcd}`)
      }
      const instructionsText = instructionsParts.join(', ') || '-'

      return [
        operation.scheduled_date,
        operation.scheduled_time,
        OperationTypeLabels[operation.operation_type],
        OperationStatusLabels[operation.status],
        operation.event_title,
        operation.client_name || 'Sem cliente',
        operation.event_location || 'A definir',
        operation.equipment_std || 0,
        operation.equipment_pcd || 0,
        operation.vehicle_license_plate || '',
        operation.driver_name || 'A definir',
        operation.producer_name || 'Não definido',
        operation.producer_phone || '',
        instructionsText,
      ]
    })

    const wsData = [headers, ...rows]
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    const colWidths = [
      { wch: 12 }, // Data
      { wch: 8 },  // Hora
      { wch: 18 }, // Tipo de Operação
      { wch: 12 }, // Status
      { wch: 35 }, // Descrição do Evento
      { wch: 25 }, // Cliente
      { wch: 35 }, // Endereço
      { wch: 10 }, // Equip. STD
      { wch: 10 }, // Equip. PCD
      { wch: 12 }, // Veículo
      { wch: 20 }, // Motorista
      { wch: 25 }, // Produtor Responsável
      { wch: 18 }, // Telefone do Produtor
      { wch: 25 }, // Instruções
    ]
    ws['!cols'] = colWidths

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Operações')

    const fileName = `operacoes-${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)

    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao exportar operações' }
  }
}
