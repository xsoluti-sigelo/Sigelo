import { createClient } from '@/shared/lib/supabase/server'
import { logger } from '@/shared/lib/logger'
import type { NewEventInvoiceData } from '../model/types'

export async function getEventInvoices(eventId: string): Promise<NewEventInvoiceData[]> {
  const supabase = await createClient()
 
  
  const { data, error } = await supabase
    .from('invoice_generation_logs' as never)
    .select(
      `
      id,
      event_id,
      order_fulfillment_id,
      of_numbers,
      invoice_id_conta_azul,
      invoice_number,
      invoice_path,
      success,
      error_message,
      created_at,
      payload_sent,
      response_payload
    `,
    )
    .eq('event_id', eventId)
    .eq('success', true)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('Error fetching event invoices', error, { eventId })
    throw new Error('Failed to fetch event invoices')
  }

  return (data || []) as NewEventInvoiceData[]
}

export async function getOrderInvoice(orderId: string): Promise<NewEventInvoiceData | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoice_generation_logs' as never)
    .select(
      `
      id,
      event_id,
      order_fulfillment_id,
      of_numbers,
      invoice_id_conta_azul,
      invoice_number,
      invoice_path,
      success,
      error_message,
      created_at,
      payload_sent,
      response_payload
    `,
    )
    .eq('order_fulfillment_id', orderId)
    .eq('success', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    logger.error('Error fetching order invoice', error, { orderId })
    return null
  }

  return data as NewEventInvoiceData | null
}

export async function getLatestSuccessfulInvoice(
  eventId: string,
): Promise<NewEventInvoiceData | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoice_generation_logs' as never)
    .select(
      `
      id,
      event_id,
      order_fulfillment_id,
      of_numbers,
      invoice_id_conta_azul,
      invoice_number,
      invoice_path,
      created_at
    `,
    )
    .eq('event_id', eventId)
    .eq('success', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    logger.error('Error fetching latest invoice', error, { eventId })
    return null
  }

  return data as NewEventInvoiceData | null
}

export async function checkEventInvoiced(eventId: string): Promise<boolean> {
  const supabase = await createClient()

  const { count } = await supabase
    .from('invoice_generation_logs' as never)
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('success', true)

  return (count ?? 0) > 0
}

export async function checkOrderInvoiced(orderId: string): Promise<boolean> {
  const supabase = await createClient()

  const { count } = await supabase
    .from('invoice_generation_logs' as never)
    .select('id', { count: 'exact', head: true })
    .eq('order_fulfillment_id', orderId)
    .eq('success', true)

  return (count ?? 0) > 0
}
