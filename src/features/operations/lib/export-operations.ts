import { OperationTypeLabels, OperationStatusLabels } from '@/features/operations/config/operations-config'
import type { OperationDisplay } from '@/features/operations/model/types'
import * as XLSX from 'xlsx'

export function exportOperationsToExcel(operations: OperationDisplay[]) {
  try {
    const hasKross = operations.some((op) => (op.equipment_kross || 0) > 0)
    const hasPia = operations.some((op) => (op.equipment_pia || 0) > 0)

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
      ...(hasKross ? ['Kross'] : []),
      ...(hasPia ? ['Pia'] : []),
      'Observação',
      'Veículo',
      'Motorista',
      'Produtor Responsável',
      'Telefone do Produtor',
    ]

    const rows = operations.map((operation) => [
      operation.scheduled_date,
      operation.scheduled_time,
      OperationTypeLabels[operation.operation_type],
      OperationStatusLabels[operation.status],
      operation.event_title,
      operation.client_name || 'Sem cliente',
      operation.event_location || 'A definir',
      operation.equipment_std || 0,
      operation.equipment_pcd || 0,
      ...(hasKross ? [operation.equipment_kross || 0] : []),
      ...(hasPia ? [operation.equipment_pia || 0] : []),
      operation.observations || '',
      operation.vehicle_license_plate || '',
      operation.driver_name || 'A definir',
      operation.producer_name || 'Não definido',
      operation.producer_phone || '',
    ])

    const wsData = [headers, ...rows]
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    const colWidths = [
      { wch: 12 },
      { wch: 8 },
      { wch: 18 },
      { wch: 12 },
      { wch: 35 },
      { wch: 25 },
      { wch: 35 },
      { wch: 10 },
      { wch: 10 },
      ...(hasKross ? [{ wch: 8 }] : []),
      ...(hasPia ? [{ wch: 8 }] : []),
      { wch: 40 },
      { wch: 12 },
      { wch: 20 },
      { wch: 25 },
      { wch: 18 },
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
