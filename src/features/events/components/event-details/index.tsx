'use client'

import { Card, Tabs } from '@/shared/ui'
import { EventType } from '@/features/events/config/event-types'
import { calculateTotalEventValue } from '@/features/events/lib'
import { EventIssuesAlert } from '../EventIssuesAlert'
import { EventHeader } from './EventHeader'
import { GeneralTab } from './GeneralTab'
import { FinancialTab } from './FinancialTab'
import { RecurrenceTab } from './RecurrenceTab'
import { CleaningTab } from './CleaningTab'
import { OperationsTab } from './OperationsTab'
import { AttachmentsTab } from './AttachmentsTab'
import { HistoryTab } from './HistoryTab'
import { EventDetailsProps } from './types'
import { EventDetailsTab } from './tab-types'
import { getEventTypeEnum } from '../../lib/enum-mappers'

export function EventDetailsWithTabs({
  event,
  operations,
  operationsCount,
  delegationStatus,
  orderFulfillments,
  eventServiceItems = [],
  eventProducers = [],
  attachments,
  invoices = [],
  invoice,
  issues,
  existingInvoiceLog,
  invoicedOrderIds = [],
  historyLogs = [],
}: EventDetailsProps) {
  const totalEventValue =
    eventServiceItems.length > 0
      ? eventServiceItems.reduce((sum, item) => sum + item.total_price, 0)
      : calculateTotalEventValue(orderFulfillments)

  const tabs: EventDetailsTab[] = [
    {
      id: 'dados',
      label: 'Dados',
      content: (
        <GeneralTab
          event={event}
          orderFulfillments={orderFulfillments}
          eventProducers={eventProducers}
        />
      ),
    },
    {
      id: 'financeiro',
      label: 'Financeiro',
      badge: orderFulfillments.length,
      content: (
        <FinancialTab
          event={event}
          orderFulfillments={orderFulfillments}
          eventServiceItems={eventServiceItems}
          operations={operations}
          existingInvoiceLog={existingInvoiceLog}
          invoicedOrderIds={invoicedOrderIds}
          totalEventValue={totalEventValue}
        />
      ),
    },
    {
      id: 'recorrencia',
      label: 'Recorrência',
      content: <RecurrenceTab event={event} />,
    },
    {
      id: 'limpezas',
      label: 'Configuração de Limpezas',
      content: <CleaningTab event={event} />,
    },
    {
      id: 'operacoes',
      label: 'Operações',
      badge: operationsCount,
      content: <OperationsTab operations={operations} />,
    },
    {
      id: 'anexos',
      label: 'Anexos',
      badge: attachments.length + (invoices?.length || 0),
      content: <AttachmentsTab attachments={attachments} invoices={invoices} />,
    },
    {
      id: 'historico',
      label: 'Histórico',
      badge: historyLogs.length,
      content: <HistoryTab historyLogs={historyLogs} />,
    },
  ].filter((tab) => {
    if (tab.id === 'recorrencia') {
      const eventTypeEnum = getEventTypeEnum(event.event_type)
      return eventTypeEnum !== EventType.UNIQUE
    }
    if (tab.id === 'limpezas') {
      return (
        event.source === 'manual' &&
        (event.event_type === 'unique' ||
          event.event_type === 'intermittent' ||
          event.event_type === 'recurring')
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      <EventIssuesAlert issues={issues} eventId={event.id} />

      <Card className="p-6">
        <EventHeader
          eventId={event.id}
          contractName={event.contract_name}
          contractNumber={event.contract_number}
          status={event.status}
          invoice={invoice}
          delegationStatus={delegationStatus}
        />
        <Tabs tabs={tabs} defaultTab="dados" />
      </Card>
    </div>
  )
}
