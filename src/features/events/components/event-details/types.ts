export type {
  OrderFulfillment,
  OrderFulfillmentItem,
  EventAttachment,
  EventIssue,
  EventProducer,
  EventProducerDb,
  InvoiceGenerationLog,
  EventWithFinancialData,
  EventInvoice,
  DelegationStatus,
} from '../../model'

export type { OperationDisplay } from '@/features/operations'
export type { EventChangeLogRecord } from '@/entities/event-change-log'

import type {
  EventWithFinancialData,
  OrderFulfillment,
  EventProducerDb,
  EventAttachment,
  EventIssue,
  InvoiceGenerationLog,
  EventInvoice,
  DelegationStatus,
} from '../../model'
import type { OperationDisplay } from '@/features/operations'
import type { EventChangeLogRecord } from '@/entities/event-change-log'

export interface EventDetailsProps {
  event: EventWithFinancialData
  operations: OperationDisplay[]
  operationsCount: number
  delegationStatus: DelegationStatus
  orderFulfillments: OrderFulfillment[]
  eventProducers?: EventProducerDb[]
  attachments: EventAttachment[]
  invoices?: Array<{
    id: string
    invoice_id_conta_azul: string | null
    invoice_number: number | null
    of_numbers: string[] | null
    created_at: string
    success: boolean
    invoice_path: string | null
  }>
  invoice?: EventInvoice | null
  issues: EventIssue[]
  existingInvoiceLog?: InvoiceGenerationLog | null
  invoicedOrderIds?: string[]
  historyLogs?: EventChangeLogRecord[]
}
