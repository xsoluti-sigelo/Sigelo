'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { documentDeleteSchema } from '../schemas'

interface DeleteDocumentResult {
  success: boolean
  error?: string
}

export async function deleteEventAttachment(
  documentId: string,
  storagePath: string,
  eventId: string,
): Promise<DeleteDocumentResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const validation = documentDeleteSchema.safeParse({ documentId, storagePath })

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Dados inválidos',
      }
    }

    const { error: dbError } = await supabase
      .from('event_attachments')
      .delete()
      .eq('id', documentId)

    if (dbError) {
      return { success: false, error: dbError.message }
    }

    const { error: storageError } = await supabase.storage
      .from('event-attachments')
      .remove([storagePath])

    if (storageError) {
      return { success: false, error: storageError.message }
    }

    revalidatePath(`/eventos/${eventId}`)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao deletar documento',
    }
  }
}

export async function deletePartyDocument(
  documentId: string,
  storagePath: string,
): Promise<DeleteDocumentResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const validation = documentDeleteSchema.safeParse({ documentId, storagePath })

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Dados inválidos',
      }
    }

    const { error: dbError } = await supabase.from('party_documents').delete().eq('id', documentId)

    if (dbError) {
      return { success: false, error: dbError.message }
    }

    const { error: storageError } = await supabase.storage
      .from('party-documents')
      .remove([storagePath])

    if (storageError) {
      return { success: false, error: storageError.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao deletar documento',
    }
  }
}
