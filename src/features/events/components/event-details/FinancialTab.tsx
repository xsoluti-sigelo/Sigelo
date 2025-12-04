'use client'

import { Card, Button } from '@/shared/ui'
import { CheckIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { formatDate, formatCurrency } from '@/shared/lib/formatters'
import { OperationStatus } from '@/features/operations/config/operation-status'
import { generateInvoice } from '@/features/operations/actions/generate-invoice'
import { showSuccessToast, showErrorToast } from '@/shared/lib/toast'
import { useTransition } from 'react'
import { FinancialReportExportButton } from '@/features/documents/components'
import { OperationDisplay } from '@/features/operations'
import { GenerateOrderInvoiceButton } from '@/features/invoices/components/new-event-invoice'
import {
  EventWithFinancialData,
  OrderFulfillment,
  EventServiceItem,
  InvoiceGenerationLog,
} from './types'
import {
  getOrderItems,
  getOrderNumber,
  getItemTotalPrice,
  getItemDescription,
  getItemDays,
} from '../../lib/order-helpers'
import type { OrderFulfillmentItem } from '../../model'

const getItemUnitPrice = (item: OrderFulfillmentItem): number => {
  return item.unit_price
}

interface FinancialTabProps {
  event: EventWithFinancialData
  orderFulfillments: OrderFulfillment[]
  eventServiceItems: EventServiceItem[]
  operations: OperationDisplay[]
  existingInvoiceLog?: InvoiceGenerationLog | null
  invoicedOrderIds?: string[]
  totalEventValue: number
}

export function FinancialTab({
  event,
  orderFulfillments,
  eventServiceItems,
  operations,
  existingInvoiceLog,
  invoicedOrderIds = [],
  totalEventValue,
}: FinancialTabProps) {
  const [isGeneratingInvoice, startGenerateInvoice] = useTransition()

  const allOperationsCompleted =
    operations.length > 0 && operations.every((op) => op.status === OperationStatus.COMPLETED)
  const hasOperations = operations.length > 0
  const hasExistingInvoice = !!existingInvoiceLog

  const eventSource = event.source?.toUpperCase()
  const isAutoEvent = eventSource === 'AUTO' || (!eventSource && orderFulfillments.length > 0)
  const isManualEvent = eventSource === 'MANUAL'

  const invoicedOrdersSet = new Set(invoicedOrderIds)
  const getOrderHasInvoice = (orderId: string, orderNumber?: string) =>
    invoicedOrdersSet.has(orderId) || (orderNumber ? invoicedOrdersSet.has(orderNumber) : false)

  const handleGenerateInvoice = () => {
    startGenerateInvoice(async () => {
      try {
        const result = await generateInvoice({ eventId: event.id })

        if (result.success) {
          if (result.invoices && result.invoices.length > 1) {
            showSuccessToast(`${result.invoices.length} faturas geradas (1 por O.F.)`)
          } else if (result.invoiceNumber) {
            showSuccessToast(`Fatura #${result.invoiceNumber} gerada!`)
          } else {
            showSuccessToast('Fatura gerada com sucesso!')
          }
          window.location.reload()
        } else {
          showErrorToast(result.error || 'Erro ao gerar fatura')
        }
      } catch {
        showErrorToast('Erro ao gerar fatura')
      }
    })
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-200 dark:border-gray-700 mb-6">
        Informações financeiras
      </h2>

      <div className="mb-6 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-teal-700 dark:text-teal-400 mb-1">Valor total do evento</p>
            <p className="text-2xl font-bold text-teal-900 dark:text-teal-300">
              {formatCurrency(totalEventValue)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-teal-700 dark:text-teal-400 mb-1">Ordens de fornecimento</p>
            <p className="text-2xl font-bold text-teal-900 dark:text-teal-300">
              {orderFulfillments.filter((of) => !of.is_cancelled).length}
            </p>
          </div>
        </div>
      </div>

      <Card className="p-6 mb-6">
        <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Informações de cobrança
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Valor do contrato
            </label>
            <p className="text-base text-gray-900 dark:text-gray-100 font-semibold">
              {formatCurrency(totalEventValue)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Número de parcelas
            </label>
            <p className="text-base text-gray-900 dark:text-gray-100">
              {event.payment_installments || '1'} parcela(s)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Frequência de cobrança
            </label>
            <p className="text-base text-gray-900 dark:text-gray-100">
              {event.payment_frequency || 'Única'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Valor das parcelas
            </label>
            <p className="text-base text-gray-900 dark:text-gray-100 font-semibold">
              {event.payment_installments && event.payment_installments > 0
                ? formatCurrency(totalEventValue / event.payment_installments)
                : formatCurrency(totalEventValue)}
            </p>
          </div>
          {event.payment_dates &&
            (Array.isArray(event.payment_dates) ? event.payment_dates.length > 0 : true) && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Datas de recebimento
                </label>
                <div className="space-y-1">
                  {Array.isArray(event.payment_dates) ? (
                    event.payment_dates.map((date: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Parcela {index + 1} de{' '}
                          {event.payment_installments || event.payment_dates?.length || 0}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatDate(date)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(event.payment_dates)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </Card>

      <div className="mb-6">
        <FinancialReportExportButton eventId={event.id} />
      </div>

      {/* Botão consolidado para eventos MANUAIS */}
      {isManualEvent && (
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {allOperationsCompleted ? (
                <>
                  <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Todas as operações concluídas
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {operations.length} operação(ões) MOLIDE finalizada(s)
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-gray-400 dark:border-gray-600 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Operações pendentes
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {hasOperations
                        ? `${operations.filter((op) => op.status !== 'COMPLETED').length} operação(ões) ainda não concluída(s)`
                        : 'Nenhuma operação criada'}
                    </p>
                  </div>
                </>
              )}
            </div>
            <Button
              onClick={handleGenerateInvoice}
              disabled={!allOperationsCompleted || isGeneratingInvoice || hasExistingInvoice}
              isLoading={isGeneratingInvoice}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                hasExistingInvoice
                  ? 'Já existe uma fatura gerada para este evento'
                  : !allOperationsCompleted
                    ? 'Todas as operações devem estar concluídas para gerar a fatura'
                    : 'Gerar fatura consolidada do evento'
              }
            >
              {isGeneratingInvoice
                ? 'Gerando...'
                : hasExistingInvoice
                  ? 'Fatura já gerada'
                  : 'Gerar Fatura Consolidada'}
            </Button>
          </div>

          {hasExistingInvoice && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-3">
                <DocumentDuplicateIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                    Fatura já gerada no ContaAzul
                  </p>
                  <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
                    <p>
                      <span className="font-semibold">Nota Fiscal:</span> #
                      {existingInvoiceLog.invoice_number || 'N/A'}
                    </p>
                    <p>
                      <span className="font-semibold">O.F.:</span>{' '}
                      {existingInvoiceLog.of_numbers?.join(', ') || 'N/A'}
                    </p>
                    <p>
                      <span className="font-semibold">Gerada em:</span>{' '}
                      {formatDate(existingInvoiceLog.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {eventServiceItems.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Serviços contratados
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Serviço
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                    Quantidade
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                    Diárias
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                    Valor unit.
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                    Valor total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {eventServiceItems.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                      {service.contaazul_services?.name || 'Serviço'}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900 dark:text-gray-100">
                      {service.quantity}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900 dark:text-gray-100">
                      {service.daily_rate}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                      {formatCurrency(service.unit_price)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(service.total_price)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 dark:bg-gray-800 font-semibold">
                  <td colSpan={4} className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                    Total dos serviços:
                  </td>
                  <td className="px-4 py-3 text-right text-teal-600 dark:text-teal-400">
                    {formatCurrency(eventServiceItems.reduce((sum, s) => sum + s.total_price, 0))}
                  </td>
                </tr>
              </tbody>
            </table>
            {eventServiceItems.some((s) => s.notes) && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {eventServiceItems
                  .filter((s) => s.notes)
                  .map((s) => (
                    <div key={s.id}>
                      <strong>{s.contaazul_services?.name}:</strong> {s.notes}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {orderFulfillments.length > 0 ? (
        <div className="space-y-4">
          {/* Para eventos manuais, mostrar apenas os itens sem o card da OF */}
          {isManualEvent ? (
            <>
              <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                Serviços do evento
              </h3>
              {orderFulfillments
                .filter((of) => getOrderNumber(of).startsWith('MANUAL-'))
                .map((of) => (
                  <div key={of.id}>
                    {getOrderItems(of) && getOrderItems(of).length > 0 && (
                      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                Serviço
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                Qtd
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                Diárias
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                                Valor unit.
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                                Valor total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {getOrderItems(of)?.map((item) => (
                              <tr
                                key={item.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                              >
                                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                                  {getItemDescription(item)}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-900 dark:text-gray-100">
                                  {item.quantity}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-900 dark:text-gray-100">
                                  {getItemDays(item)}x
                                </td>
                                <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100 font-mono">
                                  {formatCurrency(getItemUnitPrice(item))}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100 font-mono font-semibold">
                                  {formatCurrency(getItemTotalPrice(item))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gray-50 dark:bg-gray-800 border-t-2 border-gray-300 dark:border-gray-600">
                              <td
                                colSpan={4}
                                className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300"
                              >
                                Total dos serviços:
                              </td>
                              <td className="px-4 py-3 text-right text-sm font-bold text-teal-600 dark:text-teal-400 font-mono">
                                {formatCurrency(
                                  getOrderItems(of)?.reduce(
                                    (sum, item) => sum + getItemTotalPrice(item),
                                    0,
                                  ) || 0,
                                )}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
            </>
          ) : (
            <>
              <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                Ordens de fornecimento (O.F.)
              </h3>

              {orderFulfillments.map((of) => (
                <div
                  key={of.id}
                  className={`p-4 border rounded-lg ${
                    of.is_cancelled
                      ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        O.F. {getOrderNumber(of)}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Criada em {formatDate(of.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                          of.is_cancelled
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                        }`}
                      >
                        {of.is_cancelled ? 'Cancelada' : 'Ativa'}
                      </span>
                      {isAutoEvent && !of.is_cancelled && (
                        <GenerateOrderInvoiceButton
                          eventId={event.id}
                          orderId={of.id}
                          orderNumber={getOrderNumber(of)}
                          disabled={!allOperationsCompleted}
                          hasInvoice={getOrderHasInvoice(of.id, getOrderNumber(of))}
                        />
                      )}
                    </div>
                  </div>

                  {getOrderItems(of) && getOrderItems(of).length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                              Equipamento
                            </th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                              Qtd
                            </th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                              Diárias
                            </th>
                            <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                              Valor unit.
                            </th>
                            <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                              Valor total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {getOrderItems(of)?.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-gray-100 dark:border-gray-800"
                            >
                              <td className="px-2 py-2 text-gray-900 dark:text-gray-100">
                                {getItemDescription(item)}
                              </td>
                              <td className="px-2 py-2 text-center text-gray-900 dark:text-gray-100">
                                {item.quantity}
                              </td>
                              <td className="px-2 py-2 text-center text-gray-900 dark:text-gray-100">
                                {getItemDays(item)}x
                              </td>
                              <td className="px-2 py-2 text-right text-gray-900 dark:text-gray-100 font-mono">
                                {formatCurrency(getItemUnitPrice(item))}
                              </td>
                              <td className="px-2 py-2 text-right text-gray-900 dark:text-gray-100 font-mono font-semibold">
                                {formatCurrency(getItemTotalPrice(item))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                            <td
                              colSpan={4}
                              className="px-2 py-2 text-right text-sm font-semibold text-gray-700 dark:text-gray-300"
                            >
                              Subtotal O.F.:
                            </td>
                            <td className="px-2 py-2 text-right text-sm font-bold text-gray-900 dark:text-gray-100 font-mono">
                              {formatCurrency(
                                getOrderItems(of)?.reduce(
                                  (sum, item) => sum + getItemTotalPrice(item),
                                  0,
                                ) || 0,
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Nenhum item encontrado nesta O.F.
                    </p>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Nenhuma ordem de fornecimento encontrada.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            As O.F.s são criadas automaticamente pelo processador de emails.
          </p>
        </div>
      )}
    </Card>
  )
}
