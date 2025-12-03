import type { EventDisplay } from './entity-event-types'
import type { EventParty } from './shared-types'
import type { OrderFulfillment } from './order-types'
import type { EventAttachment } from './attachment-types'
import type { EventServiceItem } from './event-types'
import type { EventProducer } from './producer-types'
import type { InvoiceGenerationLog } from './invoice-types'
import type { OperationDisplay } from '@/features/operations'
import type { EventInvoice } from './api-types'
import type { DelegationStatus } from './delegation-types'
import type { EventChangeLogRecord } from '@/entities/event-change-log'
import type { Issue } from '@/features/issues'

export type EventIssue = Issue

export type EventWithFinancialData = EventDisplay & {
  parties?: EventParty | null
  payment_installments?: number | null
  payment_frequency?: string | null
  payment_dates?: string[] | string | null
  cleaning_rule?: { weekdays?: number[]; time?: string } | null
  source?: string
}

export interface EventDetailsData {
  event: EventWithFinancialData
  operations: OperationDisplay[]
  operationsCount: number
  delegationStatus: DelegationStatus
  orderFulfillments: OrderFulfillment[]
  eventServiceItems: EventServiceItem[]
  eventProducers: EventProducer[]
  attachments: EventAttachment[]
  invoice: EventInvoice | null
  issues: EventIssue[]
  existingInvoiceLog: InvoiceGenerationLog | null
  invoicedOrderIds: string[]
  historyLogs: EventChangeLogRecord[]
}
