'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { logger } from '@/shared/lib/logger'

export interface ExistingInvoiceCheck {
  hasInvoice: boolean
  invoiceNumbers?: number[]
  ofNumbers?: string[]
  createdAt?: string
  invoiceId?: string
}

export async function checkExistingInvoice(
  eventId: string,
  tenantId: string,
): Promise<ExistingInvoiceCheck> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoice_generation_logs')
    .select('id, invoice_number, of_numbers, created_at, invoice_id_conta_azul')
    .eq('new_event_id', eventId)
    .eq('tenant_id', tenantId)
    .eq('success', true)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    logger.error('Erro ao verificar invoices', { error })
    return { hasInvoice: false }
  }

  if (!data || data.length === 0) {
    return { hasInvoice: false }
  }

  const invoice = data[0]

  return {
    hasInvoice: true,
    invoiceNumbers: invoice.invoice_number ? [invoice.invoice_number] : [],
    ofNumbers: invoice.of_numbers || [],
    createdAt: invoice.created_at,
    invoiceId: invoice.invoice_id_conta_azul || undefined,
  }
}
