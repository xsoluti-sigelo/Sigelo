import type { ContaAzulSaleItem } from '@/features/integrations/contaazul'
import { PRODUCT_IDS, PAYMENT_INFO_LINES } from './constants'
import type { EventData, OrderFulfillment } from './types'

export function calculateDailyRates(startDatetime: string, endDatetime: string): number {
  const start = new Date(startDatetime)
  const end = new Date(endDatetime)
  const diffInMs = end.getTime() - start.getTime()
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
  return Math.max(1, diffInDays)
}

export function buildInvoiceNotes(event: EventData): string {
  const ofNumbers =
    event.order_fulfillments
      ?.filter((of) => !of.is_cancelled)
      .map((of) => of.of_number)
      .join(', ') || ''

  const startDatetime = event.start_time
    ? `${event.start_date}T${event.start_time}`
    : `${event.start_date}T00:00:00`
  const endDatetime = event.end_date && event.end_time
    ? `${event.end_date}T${event.end_time}`
    : event.end_date
      ? `${event.end_date}T23:59:59`
      : `${event.start_date}T23:59:59`

  const startDate = new Date(startDatetime).toLocaleDateString('pt-BR')
  const endDate = new Date(endDatetime).toLocaleDateString('pt-BR')
  const startTime = new Date(startDatetime).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const endTime = new Date(endDatetime).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const lines: string[] = [
    ...PAYMENT_INFO_LINES,
    `CONTRATO Nº ${event.contract || ''}`,
    'PROCESSO DE COMPRAS Nº 7210.2024/0006306-9',
    `ORDEM DE FORNECIMENTO Nº ${ofNumbers}`,
    `EVENTO: ${event.number} - ${event.name}`,
    `PERÍODO: de ${startDate} até ${endDate}, de ${startTime}h até ${endTime}h`,
  ]

  lines.push('')
  lines.push(
    'A ATIVIDADE DE LOCAÇÃO DE BENS MÓVEIS É ISENTA DE EMISSÃO DE NOTA FISCAL CONFORME LEI Nº 8.846 DE 21/01/94.',
  )

  return lines.join('\n')
}

export function buildSaleItemsForOF(
  of: OrderFulfillment,
  dailyRates?: number,
): ContaAzulSaleItem[] {
  const items: ContaAzulSaleItem[] = []

  if (of.of_items && of.of_items.length > 0) {
    for (const item of of.of_items) {
      if (!item.equipment_types) continue
      const category = item.equipment_types.category
      const productId =
        category === 'BANHEIRO_PCD' ? PRODUCT_IDS.BANHEIRO_PCD : PRODUCT_IDS.BANHEIRO_PADRAO
      if (!productId) continue

      const description = item.equipment_types.name
      const fullDescription = dailyRates
        ? `${description}\n${dailyRates} DIÁRIA${dailyRates > 1 ? 'S' : ''}`
        : description

      items.push({
        product: { id: productId },
        quantity: item.quantity,
        unitPrice: item.unit_price || 0,
        total: item.total_price || 0,
        description: fullDescription,
      })
    }
  }

  return items
}
