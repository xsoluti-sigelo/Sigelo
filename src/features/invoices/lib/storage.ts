import { createAdminClient } from '@/shared/lib/supabase/admin'
import { logger } from '@/shared/lib/logger'

const EVENT_INVOICES_BUCKET =
  process.env.NEXT_PUBLIC_EVENT_INVOICES_BUCKET ||
  process.env.EVENT_INVOICES_BUCKET ||
  'event-attachments'

export interface UploadInvoicePdfParams {
  tenantId: string
  eventId: string
  invoiceId: string
  invoiceNumber?: number
  pdfBuffer: ArrayBuffer | Uint8Array | Buffer
}

function ensureBuffer(data: ArrayBuffer | Uint8Array | Buffer): Buffer {
  if (Buffer.isBuffer(data)) {
    return data
  }

  if (data instanceof Uint8Array) {
    return Buffer.from(data)
  }

  return Buffer.from(new Uint8Array(data))
}

function buildInvoiceFileName(invoiceNumber: number | undefined, invoiceId: string) {
  if (invoiceNumber && Number.isFinite(invoiceNumber)) {
    const padded = invoiceNumber.toString().padStart(6, '0')
    return `invoice-${padded}-${invoiceId}.pdf`
  }

  return `invoice-${invoiceId}.pdf`
}

export async function uploadInvoicePdfToStorage(
  params: UploadInvoicePdfParams,
): Promise<string | null> {
  const { tenantId, eventId, invoiceId } = params

  if (!tenantId || !eventId || !invoiceId) {
    logger.warn('Missing identifiers to upload invoice PDF', {
      tenantId,
      eventId,
      invoiceId,
    })
    return null
  }

  try {
    const adminClient = createAdminClient()
    const buffer = ensureBuffer(params.pdfBuffer)
    const fileName = buildInvoiceFileName(params.invoiceNumber, invoiceId)
    const storagePath = `${tenantId}/events/${eventId}/invoices/${fileName}`

    const { error } = await adminClient.storage
      .from(EVENT_INVOICES_BUCKET)
      .upload(storagePath, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (error) {
      logger.error('Failed to upload invoice PDF to storage', error, {
        tenantId,
        eventId,
        storagePath,
        bucket: EVENT_INVOICES_BUCKET,
      })
      return null
    }

    logger.info('Invoice PDF uploaded to storage', {
      tenantId,
      eventId,
      storagePath,
      bucket: EVENT_INVOICES_BUCKET,
    })

    return storagePath
  } catch (error) {
    logger.error('Unexpected error uploading invoice PDF', error as Error, {
      tenantId,
      eventId,
      invoiceId,
    })
    return null
  }
}
