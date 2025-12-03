export interface FinancialReportService {
  id: string
  name: string
  quantity: number
  dailyRate: number
  unitValue: number
  totalValue: number
}

export interface FinancialReportOrderItem {
  id: string
  description: string
  quantity: number
  dailyRate: number
  unitValue: number
  totalValue: number
}

export interface FinancialReportOrder {
  id: string
  orderNumber: string
  status: string
  createdAt: string
  items: FinancialReportOrderItem[]
  totalValue: number
}

export interface FinancialReportPayment {
  installmentNumber: number
  dueDate: string
  amount: number
  status: 'pending' | 'paid' | 'overdue'
}

export interface FinancialReportClientData {
  name: string
  document: string
  contractName: string
}

export interface FinancialReportEventData {
  contractName: string
  startDate: string
  endDate: string
  totalValue: number
  installments: number
  installmentFrequency: string
}

export interface FinancialReportData {
  reportDate: string
  client: FinancialReportClientData
  event: FinancialReportEventData
  services: FinancialReportService[]
  orders: FinancialReportOrder[]
  payments: FinancialReportPayment[]
  summary: {
    totalValue: number
    paidValue: number
    pendingValue: number
    overdueValue: number
  }
}

export interface FinancialReportExportOptions {
  eventId: string
  includeServices?: boolean
  includeOrders?: boolean
  includePayments?: boolean
  format?: 'pdf' | 'xlsx'
}

export interface FinancialReportExportResult {
  success: boolean
  data?: string
  mimeType?: string
  fileName?: string
  error?: string
}
