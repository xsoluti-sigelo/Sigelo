import { Breadcrumb } from '@/shared/ui'
import { getEventById } from '@/features/events/api'
import { EventDetailsWithTabs } from '@/features/events'
import { getEventDetails } from '@/features/events/services/getEventDetails'
import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ROUTES } from '@/shared/config'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  if (id === 'criar') {
    return {
      title: 'Criar evento - Eventos - Sigelo',
      description: 'Criar um novo evento no sistema',
    }
  }

  const event = await getEventById(id)

  if (!event) {
    return {
      title: 'Evento não encontrado - Sigelo',
      description: 'O evento solicitado não foi encontrado',
    }
  }

  return {
    title: `${event.contract_name} - Eventos - Sigelo`,
    description: `Detalhes do evento ${event.contract_name}`,
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params

  if (id === 'criar') {
    redirect(ROUTES.EVENTS_CREATE)
  }

  const eventDetails = await getEventDetails(id)

  if (!eventDetails || !eventDetails.event) {
    notFound()
  }

  const {
    event,
    operations,
    operationsCount,
    delegationStatus,
    orderFulfillments,
    financialData,
    parsedCleaningRule,
    eventProducers,
    eventServiceItems,
    attachments,
    invoices,
    invoice,
    invoiceGenerationLog,
    invoicedOrderIds,
    eventIssues,
    historyLogs,
  } = eventDetails

  return (
    <div className="p-8 w-full">
      <div className="max-w-[1600px] mx-auto">
        <Breadcrumb
          items={[{ label: 'Eventos', href: ROUTES.EVENTS }, { label: event.contract_name }]}
          className="mb-6"
        />

        <EventDetailsWithTabs
          event={{
            ...event,
            payment_installments: financialData?.quantity ?? null,
            payment_frequency: financialData?.payment_method ?? 'Única',
            payment_dates: financialData?.payment_date ? [financialData.payment_date] : null,
            cleaning_rule: parsedCleaningRule,
          }}
          operations={operations}
          operationsCount={operationsCount}
          delegationStatus={delegationStatus}
          orderFulfillments={orderFulfillments}
          eventServiceItems={eventServiceItems}
          eventProducers={eventProducers}
          attachments={attachments}
          invoices={invoices}
          invoice={invoice}
          issues={eventIssues}
          existingInvoiceLog={invoiceGenerationLog}
          invoicedOrderIds={invoicedOrderIds}
          historyLogs={historyLogs}
        />
      </div>
    </div>
  )
}
