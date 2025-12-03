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
      'Número do Evento',
      'Descrição do Evento',
      'Local',
      'Equipamentos STD',
      'O.F. STD',
      'Equipamentos PCD',
      'O.F. PCD',
      'Motorista',
      'Ajudante',
      'Produtor Responsável',
      'Telefone do Produtor',
      'Observações',
    ]

    const rows = operations.map((operation) => [
      operation.scheduled_date,
      operation.scheduled_time,
      OperationTypeLabels[operation.operation_type],
      OperationStatusLabels[operation.status],
      operation.event_number,
      operation.event_title,
      operation.event_location || 'A definir',
      operation.equipment_std || 0,
      operation.of_number_std || '',
      operation.equipment_pcd || 0,
      operation.of_number_pcd || '',
      operation.driver_name || 'A definir',
      operation.helper_name || '',
      operation.producer_name || 'Não definido',
      operation.producer_phone || '',
      operation.observations || '',
    ])

    const wsData = [headers, ...rows]
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    const colWidths = [
      { wch: 12 },
      { wch: 8 },
      { wch: 18 },
      { wch: 12 },
      { wch: 15 },
      { wch: 30 },
      { wch: 35 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 25 },
      { wch: 18 },
      { wch: 30 },
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
