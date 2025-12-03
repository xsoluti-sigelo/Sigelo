'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { getUserData } from '@/entities/user'
import { z } from 'zod'

const downloadInvoiceSchema = z.object({
  storagePath: z.string().min(1, 'Storage path é obrigatório'),
  fileName: z.string().min(1, 'File name é obrigatório'),
})

export interface DownloadInvoiceResult {
  success: boolean
  data?: string
  fileName?: string
  mimeType?: string
  error?: string
}

export async function downloadInvoice(
  input: z.infer<typeof downloadInvoiceSchema>,
): Promise<DownloadInvoiceResult> {
  const result = downloadInvoiceSchema.safeParse(input)

  if (!result.success) {
    return {
      success: false,
      error: 'Dados inválidos',
    }
  }

  const { storagePath, fileName } = result.data
  try {
    const supabase = await createClient()
    const { tenant_id } = await getUserData()

    const pathParts = storagePath.split('/')
    const fileTenantId = pathParts[0]

    if (fileTenantId !== tenant_id) {
      throw new Error('Unauthorized: File does not belong to your tenant')
    }

    const EVENT_INVOICES_BUCKET = 'event-attachments'

    const { data, error } = await supabase.storage.from(EVENT_INVOICES_BUCKET).download(storagePath)

    if (error) {
      throw new Error(`Failed to download file: ${error.message}`)
    }

    const arrayBuffer = await data.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')


    return {
      success: true,
      data: base64,
      fileName,
      mimeType: data.type || 'application/pdf',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
