'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'
import { getUserData } from '@/entities/user'

interface UploadAttachmentInput {
  eventId: string
  fileName: string
  fileData: string
  fileType: string
  fileSize: number
}

interface UploadAttachmentResult {
  success: boolean
  attachmentId?: string
  storagePath?: string
  error?: string
}

export async function uploadEventAttachment(
  input: UploadAttachmentInput,
): Promise<UploadAttachmentResult> {
  try {
    const adminClient = createAdminClient()
    const { tenant_id, id: user_id } = await getUserData()

    const { eventId, fileName, fileData, fileType, fileSize } = input

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (fileSize > maxSize) {
      return {
        success: false,
        error: 'Arquivo excede o tamanho máximo de 10MB',
      }
    }

    const base64Data = fileData.replace(/^data:[^;]+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    const timestamp = Date.now()
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `${tenant_id}/events/${eventId}/attachments/${timestamp}_${safeFileName}`

    const { error: uploadError } = await adminClient.storage
      .from('event-attachments')
      .upload(storagePath, buffer, {
        contentType: fileType,
        upsert: false,
      })

    if (uploadError) {
      return {
        success: false,
        error: `Erro no upload: ${uploadError.message}`,
      }
    }

    const attachmentId = crypto.randomUUID()

    const { error: dbError } = await adminClient.from('event_attachments').insert({
      id: attachmentId,
      event_id: eventId,
      tenant_id,
      file_name: fileName,
      file_size: fileSize,
      file_type: fileType,
      storage_path: storagePath,
      uploaded_by: user_id,
      created_at: new Date().toISOString(),
    })

    if (dbError) {
      await adminClient.storage.from('event-attachments').remove([storagePath])

      return {
        success: false,
        error: 'Erro ao salvar informações do arquivo',
      }
    }

    return {
      success: true,
      attachmentId,
      storagePath,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

export async function uploadEventAttachments(
  eventId: string,
  attachments: Array<{
    fileName: string
    fileData: string
    fileType: string
    fileSize: number
  }>,
): Promise<{ success: boolean; uploadedCount: number; errors: string[] }> {
  const errors: string[] = []
  let uploadedCount = 0

  for (const attachment of attachments) {
    const result = await uploadEventAttachment({
      eventId,
      ...attachment,
    })

    if (result.success) {
      uploadedCount++
    } else {
      errors.push(`${attachment.fileName}: ${result.error}`)
    }
  }

  return {
    success: errors.length === 0,
    uploadedCount,
    errors,
  }
}
