'use client'

import { formatDate, formatCPFCNPJ } from '@/shared/lib/formatters'
import type { EventWithFinancialData, OrderFulfillment, EventProducer } from '../../model'
import {
  OrderFulfillmentStatusLabels,
  OrderFulfillmentStatusColors,
  OrderFulfillmentStatus,
} from '@/shared/config/enums'
import { getEventTypeLabel, getEventTypeColor } from '../../lib/enum-mappers'
import { getOrderNumber, separateEquipmentTypes } from '../../lib/order-helpers'
import { FieldDisplay } from './FieldDisplay'
import { DetailSection } from './DetailSection'
import { ListItemCard } from './ListItemCard'

interface GeneralTabProps {
  event: EventWithFinancialData
  orderFulfillments: OrderFulfillment[]
  eventProducers: EventProducer[]
}

export function GeneralTab({ event, orderFulfillments, eventProducers }: GeneralTabProps) {
  const getPrimaryContact = (contactType: 'email' | 'phone' | 'mobile') => {
    if (!event.parties) return '-'

    if (contactType === 'email') return event.parties.email || '-'
    if (contactType === 'phone') return event.parties.business_phone || '-'
    if (contactType === 'mobile') return event.parties.mobile_phone || '-'

    return '-'
  }

  const renderDateWithTime = (dateString?: string | null) => {
    if (!dateString) return '-'

    const timeString = (() => {
      try {
        const parsed = new Date(dateString)
        if (Number.isNaN(parsed.getTime())) return '--:--'
        return parsed.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      } catch {
        return '--:--'
      }
    })()

    return (
      <div className="flex flex-col leading-tight">
        <span>{formatDate(dateString)}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{timeString}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DetailSection title="Informações do evento">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FieldDisplay
            label="Cliente"
            value={<span className="font-medium">{event.client_name}</span>}
          />
          <FieldDisplay
            label="Tipo de evento"
            value={
              <span
                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}
              >
                {getEventTypeLabel(event.event_type)}
              </span>
            }
          />
          <FieldDisplay
            label="Início (data e horário)"
            value={renderDateWithTime(event.start_date)}
          />
          <FieldDisplay
            label="Término (data e horário)"
            value={renderDateWithTime(event.end_date)}
          />
        </div>
      </DetailSection>

      {orderFulfillments && orderFulfillments.length > 0 && (
        <DetailSection title="Ordens de fornecimento">
          <div className="space-y-2">
            {orderFulfillments.map((of) => {
              const { stdTotal, pcdTotal } = separateEquipmentTypes(of.new_order_items)

              return (
                <div
                  key={of.id}
                  className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                      O.F. {getOrderNumber(of)}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        of.is_cancelled
                          ? OrderFulfillmentStatusColors[OrderFulfillmentStatus.CANCELLED]
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {of.is_cancelled
                        ? OrderFulfillmentStatusLabels[OrderFulfillmentStatus.CANCELLED]
                        : OrderFulfillmentStatusLabels[OrderFulfillmentStatus.ACTIVE]}
                    </span>
                  </div>
                  <div className="text-xs text-gray-900 dark:text-gray-100">
                    {stdTotal > 0 && (
                      <div>
                        STD {stdTotal}
                        <span className="text-gray-500 dark:text-gray-400">
                          {' '}
                          - OF: {getOrderNumber(of)}
                        </span>
                      </div>
                    )}
                    {pcdTotal > 0 && (
                      <div className="mt-0.5">
                        PCD {pcdTotal}
                        <span className="text-gray-500 dark:text-gray-400">
                          {' '}
                          - OF: {getOrderNumber(of)}
                        </span>
                      </div>
                    )}
                    {stdTotal === 0 && pcdTotal === 0 && (
                      <span className="text-gray-500 dark:text-gray-400">Sem equipamentos</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </DetailSection>
      )}

      {event.parties && (
        <DetailSection title="Informações do cliente">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FieldDisplay label="Nome" value={event.parties.name} />
            <FieldDisplay
              label="Tipo"
              value={
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    event.parties.person_type === 'JURIDICA'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                  }`}
                >
                  {event.parties.person_type === 'JURIDICA'
                    ? 'Pessoa Jurídica (PJ)'
                    : 'Pessoa Física (PF)'}
                </span>
              }
            />
            <FieldDisplay
              label={event.parties.cpf ? 'CPF' : event.parties.cnpj ? 'CNPJ' : 'CPF/CNPJ'}
              value={
                <span className="font-mono">
                  {formatCPFCNPJ(event.parties.cnpj || event.parties.cpf || '-')}
                </span>
              }
            />
            <FieldDisplay label="E-mail" value={getPrimaryContact('email')} />
            <FieldDisplay
              label="Telefone"
              value={
                <span className="font-mono">
                  {getPrimaryContact('phone') !== '-'
                    ? getPrimaryContact('phone')
                    : getPrimaryContact('mobile')}
                </span>
              }
            />
          </div>
        </DetailSection>
      )}

      {eventProducers.length > 0 && (
        <DetailSection title="Produtores do evento">
          <div className="space-y-4">
            {eventProducers.map((producer) => (
              <ListItemCard
                key={producer.id}
                title={
                  <span className="text-sm">
                    {producer.parties?.display_name || producer.parties?.full_name || 'Produtor'}
                  </span>
                }
                badge={
                  producer.is_primary ? (
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Principal
                    </span>
                  ) : undefined
                }
              >
                {producer.parties?.party_contacts && producer.parties.party_contacts.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {producer.parties.party_contacts.map((contact, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {contact.contact_type}:
                        </span>
                        <span className="text-xs text-gray-900 dark:text-gray-100">
                          {contact.contact_value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </ListItemCard>
            ))}
          </div>
        </DetailSection>
      )}
    </div>
  )
}
