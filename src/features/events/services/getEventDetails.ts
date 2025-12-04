import { createClient } from '@/shared/lib/supabase/server'
import { getUserData } from '@/entities/user'
import {
  getEventById,
  getEventAttachments,
  getEventInvoice,
  getEventInvoices,
} from '../api'
import { getOperations } from '@/features/operations'
import { getDelegationStatus } from './delegationStatus'

import type {
  OrderFulfillment,
  InvoiceGenerationLog,
  EventFinancialData,
  EventProducerDb,
  FullEventData,
  EventServiceItem,
} from '../model'
import type { EventChangeLogRecord } from '@/entities/event-change-log'
import type { Issue } from '@/features/issues'
import type { CleaningRule } from '../config/events-config'

export interface EventDetailsData {
  event: Awaited<ReturnType<typeof getEventById>>
  operations: Awaited<ReturnType<typeof getOperations>>['data']
  operationsCount: Awaited<ReturnType<typeof getOperations>>['count']
  delegationStatus: Awaited<ReturnType<typeof getDelegationStatus>>
  orderFulfillments: OrderFulfillment[]
  financialData: EventFinancialData | null
  fullEventData: FullEventData
  parsedCleaningRule: CleaningRule | null
  eventProducers: EventProducerDb[]
  eventServiceItems: EventServiceItem[]
  attachments: Awaited<ReturnType<typeof getEventAttachments>>
  invoices: Awaited<ReturnType<typeof getEventInvoices>>
  invoice: Awaited<ReturnType<typeof getEventInvoice>>
  invoiceGenerationLog: InvoiceGenerationLog | null
  invoicedOrderIds: string[]
  eventIssues: Issue[]
  historyLogs: EventChangeLogRecord[]
}

export async function getEventDetails(eventId: string): Promise<EventDetailsData | null> {
  const supabase = await createClient()
  const { tenant_id } = await getUserData()

  const event = await getEventById(eventId)
  if (!event) {
    return null
  }

  const [
    { data: operations, count: operationsCount },
    delegationStatus,
    { data: orderFulfillments },
    { data: financialData },
    { data: fullEventData },
    { data: eventProducers },
    { data: eventServiceItems },
    attachments,
    invoices,
    invoice,
    { data: invoiceGenerationLogs },
    { data: eventIssues },
    { data: historyLogs },
  ] = await Promise.all([
    getOperations({ event_id: eventId, limit: 100 }),
    getDelegationStatus(eventId),
    supabase
      .from('new_orders')
      .select(
        `
        *,
        new_order_items(
          *,
          new_order_items_contaazul_services(
            contaazul_services(
              id,
              name,
              rate
            )
          )
        )
      `,
      )
      .eq('event_id', eventId)
      .order('created_at', { ascending: true }),
    Promise.resolve({ data: null, error: null }),
    supabase.from('new_events').select('*').eq('id', eventId).single(),
    supabase
      .from('new_people')
      .select('*')
      .eq('event_id', eventId)
      .in('role', ['producer', 'coordinator']),
    supabase
      .from('event_service_items' as never)
      .select(
        `
        id,
        contaazul_service_id,
        quantity,
        unit_price,
        daily_rate,
        total_price,
        notes,
        contaazul_services!contaazul_service_id(
          id,
          contaazul_id,
          name,
          rate
        )
      `,
      )
      .eq('event_id', eventId)
      .eq('tenant_id', tenant_id),
    getEventAttachments(eventId),
    getEventInvoices(eventId),
    getEventInvoice(eventId),
    supabase
      .from('invoice_generation_logs' as never)
      .select(
        'id, invoice_number, of_numbers, created_at, invoice_id_conta_azul, success, new_order_id, order_fulfillment_id, invoice_path',
      )
      .eq('new_event_id', eventId)
      .eq('tenant_id', tenant_id)
      .eq('success', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('new_issues')
      .select('*')
      .eq('event_id', eventId)
      .order('severity', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('event_change_logs')
      .select(
        `
        *,
        users:users!event_change_logs_changed_by_fkey(
          full_name,
          email
        ),
        operation:new_operations!event_change_logs_operation_id_fkey(
          type,
          subtype,
          date,
          time
        )
      `,
      )
      .eq('event_id', eventId)
      .eq('tenant_id', tenant_id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const normalizedInvoiceLogs = (invoiceGenerationLogs || []) as InvoiceGenerationLog[]

  return {
    event,
    operations: operations || [],
    operationsCount: operationsCount || 0,
    delegationStatus,
    orderFulfillments: (orderFulfillments || []) as OrderFulfillment[],
    financialData,
    fullEventData: {
      ...fullEventData!,
      cleaning_rule: fullEventData!.cleaning_rule as unknown as CleaningRule | null | undefined,
    },
    parsedCleaningRule: null,
    eventProducers: (eventProducers || []) as EventProducerDb[],
    eventServiceItems: (eventServiceItems || []) as EventServiceItem[],
    attachments,
    invoices,
    invoice,
    invoiceGenerationLog: normalizedInvoiceLogs[0] || null,
    invoicedOrderIds:
      normalizedInvoiceLogs.reduce<string[]>((acc, log) => {
        if (log.order_fulfillment_id) {
          acc.push(log.order_fulfillment_id)
        }
        if (log.of_numbers && Array.isArray(log.of_numbers)) {
          log.of_numbers.forEach((ofNumber: string) => {
            if (ofNumber && !acc.includes(ofNumber)) {
              acc.push(ofNumber)
            }
          })
        }
        return acc
      }, []) || [],
    eventIssues: (eventIssues || []) as Issue[],
    historyLogs: (historyLogs || []) as EventChangeLogRecord[],
  }
}
