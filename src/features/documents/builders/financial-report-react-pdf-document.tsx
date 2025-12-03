import React from 'react'
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import { getPaymentStatusLabel, formatInstallments } from '@/shared/lib/labels'
import type { FinancialReportData } from '../types/financial-report.types'

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 8,
    fontFamily: 'Helvetica',
  },
  banner: {
    maxHeight: 60,
    maxWidth: 200,
    marginBottom: 5,
    objectFit: 'contain',
  },
  header: {
    marginBottom: 6,
  },
  title: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1e40af',
    marginTop: 8,
    marginBottom: 5,
    borderBottom: '2px solid #1e40af',
    paddingBottom: 3,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    fontWeight: 'bold',
    width: 100,
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 5,
    marginBottom: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    padding: 5,
    fontWeight: 'bold',
    borderBottom: '2px solid #9ca3af',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 5,
    borderBottom: '1px solid #e5e7eb',
  },
  tableCell: {
    fontSize: 7,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 6,
    borderTop: '1px solid #e5e7eb',
    paddingTop: 7,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
    paddingRight: 5,
  },
  totalLabel: {
    fontWeight: 'bold',
    color: '#1e40af',
  },
  cancelled: {
    color: '#dc2626',
  },
})

interface FinancialReportDocumentProps {
  data: FinancialReportData
  bannerUrl?: string
}

export const FinancialReportDocument: React.FC<FinancialReportDocumentProps> = ({
  data,
  bannerUrl,
}) => {
  const formatOptionalDate = (date?: string | null): string => {
    if (!date || date === '-') return '-'
    return formatDate(date)
  }

  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString)
    const dateStr = formatDate(isoString)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${dateStr} às ${hours}:${minutes}`
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {bannerUrl && (
          <View style={{ marginBottom: 5, alignItems: 'flex-start' }}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={bannerUrl} style={styles.banner} />
          </View>
        )}

        <View style={styles.header}>
          <Text style={styles.title}>RELATÓRIO FINANCEIRO DE EVENTO</Text>
          <Text style={styles.subtitle}>{data.event.contractName}</Text>
        </View>

        <View>
          <Text style={styles.sectionTitle}>Resumo do evento</Text>
          <View style={styles.row}>
            <Text>
              Período: {formatOptionalDate(data.event.startDate)} a{' '}
              {formatOptionalDate(data.event.endDate)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text>
              Parcelamento:{' '}
              {formatInstallments(data.event.installments, data.event.installmentFrequency)}
            </Text>
          </View>
          <View style={{ ...styles.row, marginTop: 2 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 9 }}>
              Valor Total: {formatCurrency(data.event.totalValue)}
            </Text>
          </View>
        </View>

        <View>
          <Text style={styles.sectionTitle}>Dados do cliente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Cliente:</Text>
            <Text style={styles.value}>{data.client.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Documento:</Text>
            <Text style={styles.value}>{data.client.document}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Contrato:</Text>
            <Text style={styles.value}>{data.client.contractName}</Text>
          </View>
        </View>

        <View>
          <Text style={styles.sectionTitle}>Resumo financeiro</Text>
          <View style={styles.row}>
            <Text>Valor Pago: {formatCurrency(data.summary.paidValue)}</Text>
          </View>
          <View style={styles.row}>
            <Text>Valor Pendente: {formatCurrency(data.summary.pendingValue)}</Text>
          </View>
          <View style={styles.row}>
            <Text>Valor Vencido: {formatCurrency(data.summary.overdueValue)}</Text>
          </View>
        </View>

        {data.payments.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Cronograma de pagamentos</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ ...styles.tableCell, width: 60 }}>Parcela</Text>
                <Text style={{ ...styles.tableCell, width: 90 }}>Vencimento</Text>
                <Text
                  style={{ ...styles.tableCell, width: 110, textAlign: 'right', paddingRight: 5 }}
                >
                  Valor
                </Text>
                <Text style={{ ...styles.tableCell, flex: 1, paddingLeft: 5 }}>Status</Text>
              </View>
              {data.payments.map((payment, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={{ ...styles.tableCell, width: 60 }}>
                    {payment.installmentNumber}/{data.payments.length}
                  </Text>
                  <Text style={{ ...styles.tableCell, width: 90 }}>
                    {formatOptionalDate(payment.dueDate)}
                  </Text>
                  <Text
                    style={{ ...styles.tableCell, width: 110, textAlign: 'right', paddingRight: 5 }}
                  >
                    {formatCurrency(payment.amount)}
                  </Text>
                  <Text style={{ ...styles.tableCell, flex: 1, paddingLeft: 5 }}>
                    {getPaymentStatusLabel(payment.status)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {data.services.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Serviços contratados</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ ...styles.tableCell, width: 150 }}>Serviço</Text>
                <Text style={{ ...styles.tableCell, width: 50, textAlign: 'center' }}>Qtd</Text>
                <Text style={{ ...styles.tableCell, width: 60, textAlign: 'center' }}>Diárias</Text>
                <Text style={{ ...styles.tableCell, width: 90, textAlign: 'right' }}>
                  Valor Unit.
                </Text>
                <Text style={{ ...styles.tableCell, flex: 1, textAlign: 'right' }}>
                  Valor Total
                </Text>
              </View>
              {data.services.map((service, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={{ ...styles.tableCell, width: 150 }}>{service.name}</Text>
                  <Text style={{ ...styles.tableCell, width: 50, textAlign: 'center' }}>
                    {service.quantity}
                  </Text>
                  <Text style={{ ...styles.tableCell, width: 60, textAlign: 'center' }}>
                    {service.dailyRate}
                  </Text>
                  <Text style={{ ...styles.tableCell, width: 90, textAlign: 'right' }}>
                    {formatCurrency(service.unitValue)}
                  </Text>
                  <Text style={{ ...styles.tableCell, flex: 1, textAlign: 'right' }}>
                    {formatCurrency(service.totalValue)}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Total: {formatCurrency(data.services.reduce((sum, s) => sum + s.totalValue, 0))}
              </Text>
            </View>
          </View>
        )}

        {data.orders.map((order, orderIndex) => (
          <View key={orderIndex} wrap={false}>
            <Text
              style={{
                ...styles.sectionTitle,
                color: order.status === 'cancelled' ? '#dc2626' : '#1e40af',
                borderBottomColor: order.status === 'cancelled' ? '#dc2626' : '#1e40af',
              }}
            >
              Ordem de fornecimento {order.orderNumber}
            </Text>
            <View style={{ marginBottom: 5 }}>
              <Text style={{ fontSize: 7, color: '#6b7280' }}>
                Status: {order.status === 'cancelled' ? 'CANCELADA' : 'ATIVA'}
              </Text>
              <Text style={{ fontSize: 7, color: '#6b7280' }}>
                Data de Criação: {formatOptionalDate(order.createdAt)}
              </Text>
            </View>

            {order.items.length > 0 && (
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={{ ...styles.tableCell, width: 150 }}>Descrição</Text>
                  <Text style={{ ...styles.tableCell, width: 50, textAlign: 'center' }}>Qtd</Text>
                  <Text style={{ ...styles.tableCell, width: 60, textAlign: 'center' }}>
                    Diárias
                  </Text>
                  <Text style={{ ...styles.tableCell, width: 90, textAlign: 'right' }}>
                    Valor Unit.
                  </Text>
                  <Text style={{ ...styles.tableCell, flex: 1, textAlign: 'right' }}>
                    Valor Total
                  </Text>
                </View>
                {order.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.tableRow}>
                    <Text style={{ ...styles.tableCell, width: 150 }}>{item.description}</Text>
                    <Text style={{ ...styles.tableCell, width: 50, textAlign: 'center' }}>
                      {item.quantity}
                    </Text>
                    <Text style={{ ...styles.tableCell, width: 60, textAlign: 'center' }}>
                      {item.dailyRate}
                    </Text>
                    <Text style={{ ...styles.tableCell, width: 90, textAlign: 'right' }}>
                      {formatCurrency(item.unitValue)}
                    </Text>
                    <Text style={{ ...styles.tableCell, flex: 1, textAlign: 'right' }}>
                      {formatCurrency(item.totalValue)}
                    </Text>
                  </View>
                ))}
                <View style={styles.totalRow}>
                  <Text
                    style={{
                      ...styles.totalLabel,
                      color: order.status === 'cancelled' ? '#dc2626' : '#1e40af',
                    }}
                  >
                    {order.status !== 'cancelled'
                      ? `Total: ${formatCurrency(order.totalValue)}`
                      : 'Total: (Cancelada)'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        ))}

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages} - Gerado em ${formatDateTime(new Date().toISOString())}`
          }
          fixed
        />
      </Page>
    </Document>
  )
}
