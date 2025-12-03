import { StatusBadge } from '@/shared/ui'
import type { PaymentStatus } from '@/features/invoices/types'

interface PaymentStatusBadgeProps {
  status: PaymentStatus
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const variantMap: Record<
    PaymentStatus,
    'neutral' | 'info' | 'success' | 'warning' | 'error' | 'purple'
  > = {
    PENDING: 'neutral',
    INVOICED: 'info',
    PAID: 'success',
    PARTIALLY_PAID: 'warning',
    OVERDUE: 'error',
    CANCELLED: 'neutral',
    REFUNDED: 'purple',
  }

  const labels: Record<PaymentStatus, string> = {
    PENDING: 'Pendente',
    INVOICED: 'Faturado',
    PAID: 'Pago',
    PARTIALLY_PAID: 'Parcialmente Pago',
    OVERDUE: 'Vencido',
    CANCELLED: 'Cancelado',
    REFUNDED: 'Reembolsado',
  }

  return <StatusBadge label={labels[status]} variant={variantMap[status]} />
}
