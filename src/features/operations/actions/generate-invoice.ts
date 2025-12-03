'use server'

import { generateInvoiceFromEvent } from '@/features/invoices/generators'
import { checkExistingInvoice } from '@/features/invoices/lib'
import { getUserData } from '@/entities/user'
import { generateInvoiceSchema, type GenerateInvoiceInput } from '@/features/operations/lib/validations'
import { createActivityLog } from '@/features/logs'

export async function generateInvoice(input: GenerateInvoiceInput) {
  const result = generateInvoiceSchema.safeParse(input)

  if (!result.success) {
    return {
      success: false,
      error: 'Invalid event ID',
    }
  }

  const { eventId } = result.data

  const userData = await getUserData()
  if (!userData?.tenant_id) {
    return {
      success: false,
      error: 'Not authorized',
    }
  }

  const existingInvoice = await checkExistingInvoice(eventId, userData.tenant_id)

  if (existingInvoice.hasInvoice) {
    const invoiceNumbers = existingInvoice.invoiceNumbers?.join(', ') || 'N/A'
    const ofNumbers = existingInvoice.ofNumbers?.join(', ') || 'N/A'

    await createActivityLog({
      action_type: 'GENERATE_INVOICE',
      entity_type: 'event',
      entity_id: eventId,
      success: false,
      error_message: 'Invoice already exists for this event',
      metadata: {
        invoice_numbers: invoiceNumbers as never,
        of_numbers: ofNumbers as never,
      },
    })

    return {
      success: false,
      error: `Invoice already exists for this event.\nInvoice Number: ${invoiceNumbers}\nO.F.: ${ofNumbers}\nCannot generate a new invoice.`,
    }
  }

  const invoiceResult = await generateInvoiceFromEvent(eventId, userData.tenant_id, userData.id)

  if (invoiceResult.success) {
    const numbers =
      invoiceResult.invoices?.map((i) => i.invoiceNumber) ??
      (invoiceResult.invoiceNumber ? [invoiceResult.invoiceNumber] : [])
    await createActivityLog({
      action_type: 'GENERATE_INVOICE',
      entity_type: 'event',
      entity_id: eventId,
      success: true,
      new_value: {
        invoice_numbers: numbers as unknown as never,
      },
      metadata: {
        invoices_count: (invoiceResult.invoices?.length ||
          numbers?.length ||
          0) as unknown as never,
      },
    })
  } else {
    await createActivityLog({
      action_type: 'GENERATE_INVOICE',
      entity_type: 'event',
      entity_id: eventId,
      success: false,
      error_message: invoiceResult.error,
    })
  }

  return invoiceResult
}
