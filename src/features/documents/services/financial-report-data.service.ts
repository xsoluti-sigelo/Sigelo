import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/shared/lib/logger'
import type { Database } from '@/types/database.types'
import type { FinancialReportData } from '../types/financial-report.types'

type NewOrderRow = Database['public']['Tables']['new_orders']['Row']
type NewOrderItemRow = Database['public']['Tables']['new_order_items']['Row']

type EventWithClient = Database['public']['Tables']['new_events']['Row'] & {
  new_events_contaazul_pessoas?: Array<{
    contaazul_pessoas?: {
      name: string | null
      cnpj: string | null
    } | null
  }> | null
}

type OrderWithItems = NewOrderRow & { new_order_items?: NewOrderItemRow[] | null }

export class FinancialReportDataService {
  constructor(
    private supabase: SupabaseClient,
    private tenantId: string,
  ) {}

  async generateReportData(eventId: string): Promise<FinancialReportData | null> {
    try {
      const [event, orders, financialData] = await Promise.all([
        this.fetchEvent(eventId),
        this.fetchOrders(eventId),
        this.fetchFinancialData(eventId),
      ])

      if (!event) {
        return null
      }

      const clientData = (event as EventWithClient).new_events_contaazul_pessoas?.[0]
        ?.contaazul_pessoas
      const contractName = this.formatContractName(event)

      const ordersData = this.transformOrders(orders || [])

      const totalValue = ordersData.reduce(
        (sum, order) => sum + (order.status === 'cancelled' ? 0 : order.totalValue),
        0,
      )
      const eventEndDate = event.end_date || event.date || null
      const payments = this.generatePaymentSchedule(financialData, totalValue, eventEndDate)

      return {
        reportDate: new Date().toISOString(),
        client: {
          name: clientData?.name || 'Sem cliente',
          document: clientData?.cnpj || '-',
          contractName,
        },
        event: {
          contractName,
          startDate: event.start_date || event.date || '-',
          endDate: event.end_date || event.date || '-',
          totalValue,
          installments: financialData?.quantity ?? 1,
          installmentFrequency: financialData?.payment_method || 'Única',
        },
        services: [],
        orders: ordersData,
        payments,
        summary: {
          totalValue,
          paidValue: 0,
          pendingValue: totalValue,
          overdueValue: 0,
        },
      }
    } catch (error) {
      logger.error('Error generating financial report data', error)
      return null
    }
  }

  private async fetchEvent(eventId: string) {
    const { data, error } = await this.supabase
      .from('new_events')
      .select(
        `
          *,
          new_events_contaazul_pessoas(
            contaazul_pessoas(
              name,
              cnpj
            )
          )
        `,
      )
      .eq('id', eventId)
      .single()

    if (error) {
      logger.error('Error fetching event', error)
      return null
    }

    return data
  }

  private async fetchOrders(eventId: string) {
    const { data, error } = await this.supabase
      .from('new_orders')
      .select(
        `
          *,
          new_order_items(*)
        `,
      )
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })

    if (error) {
      logger.error('Error fetching orders', error)
      return []
    }

    return data
  }

  private async fetchFinancialData(eventId: string) {
    const { data, error } = await this.supabase
      .from('event_financial_data')
      .select('*')
      .eq('event_id', eventId)
      .eq('tenant_id', this.tenantId)
      .maybeSingle()

    if (error) {
      logger.error('Error fetching financial data', error)
      return null
    }

    return data
  }

  private formatContractName(event: Database['public']['Tables']['new_events']['Row']): string {
    if (event.number && event.year && event.name) {
      return `${event.number} ${event.year} - ${event.name}`
    }
    return event.name || '-'
  }

  private transformOrders(orders: OrderWithItems[]) {
    return orders.map((order) => {
      const items = (order.new_order_items || []) as NewOrderItemRow[]
      const totalValue = items.reduce((sum, item) => sum + Number(item.item_total || 0), 0)

      return {
        id: order.id,
        orderNumber: order.number || '-',
        status: order.is_cancelled ? 'cancelled' : 'active',
        createdAt: order.created_at || '',
        items: items.map((item) => ({
          id: item.id,
          description: item.description || '-',
          quantity: Number(item.quantity || 0),
          dailyRate: Number(item.days || 0),
          unitValue: Number(item.unit_price || 0),
          totalValue: Number(item.item_total || 0),
        })),
        totalValue,
      }
    })
  }

  private generatePaymentSchedule(
    financialData: { quantity?: number | null } | null,
    totalValue: number,
    eventEndDate: string | null,
  ) {
    const calculateDueDate = (monthsToAdd: number): string => {
      if (!eventEndDate) return '-'

      const endDate = new Date(eventEndDate)
      endDate.setDate(endDate.getDate() + 30)
      endDate.setMonth(endDate.getMonth() + monthsToAdd)

      return endDate.toISOString()
    }

    if (!financialData?.quantity || financialData.quantity <= 1) {
      return [
        {
          installmentNumber: 1,
          dueDate: calculateDueDate(0),
          amount: totalValue,
          status: 'pending' as const,
        },
      ]
    }

    const installments = financialData.quantity
    const installmentAmount = totalValue / installments

    return Array.from({ length: installments }, (_, index) => ({
      installmentNumber: index + 1,
      dueDate: calculateDueDate(index),
      amount: installmentAmount,
      status: 'pending' as const,
    }))
  }
}
