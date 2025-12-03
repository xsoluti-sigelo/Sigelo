'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { getUserData } from '@/entities/user'
import {
  downloadAttachmentSchema,
  type DownloadAttachmentInput,
} from '@/shared/lib/validations/event'
import type { DownloadAttachmentResult } from '@/entities/event/api/types'

export async function downloadAttachment(
  input: DownloadAttachmentInput,
): Promise<DownloadAttachmentResult> {
  const result = downloadAttachmentSchema.safeParse(input)

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

    const { data, error } = await supabase.storage.from('event-attachments').download(storagePath)

    if (error) {
      throw new Error(`Failed to download file: ${error.message}`)
    }

    const arrayBuffer = await data.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    return {
      success: true,
      data: base64,
      fileName,
      mimeType: data.type,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
