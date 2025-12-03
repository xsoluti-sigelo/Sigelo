'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { documentDownloadSchema } from '../schemas'
import { getMimeType } from '../lib'
import type { DocumentDownloadResult } from '../types'

export async function downloadDocument(
  storagePath: string,
  fileName: string,
  bucket?: string,
): Promise<DocumentDownloadResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const validation = documentDownloadSchema.safeParse({ storagePath, fileName })

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Dados inválidos',
      }
    }

    const bucketName =
      bucket || (storagePath.includes('event') ? 'event-attachments' : 'party-documents')
    const { data, error } = await supabase.storage.from(bucketName).download(storagePath)

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data) {
      return { success: false, error: 'Arquivo não encontrado' }
    }

    const arrayBuffer = await data.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString('base64')
    const mimeType = getMimeType(fileName)

    return {
      success: true,
      data: base64Data,
      mimeType,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao baixar arquivo',
    }
  }
}
