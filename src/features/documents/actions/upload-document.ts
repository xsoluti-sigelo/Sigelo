'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { eventAttachmentUploadSchema, partyDocumentUploadSchema } from '../schemas'
import type { DocumentUploadResult } from '../types'

export async function uploadEventAttachment(formData: FormData): Promise<DocumentUploadResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { data: userData } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('google_id', user.id)
      .single()

    if (!userData?.tenant_id) {
      return { success: false, error: 'Tenant não encontrado' }
    }

    const eventId = formData.get('eventId') as string
    const file = formData.get('file') as File
    const description = (formData.get('description') as string) || null
    const orderFulfillmentId = (formData.get('orderFulfillmentId') as string) || null
    const emailExtractionId = (formData.get('emailExtractionId') as string) || null

    const validation = eventAttachmentUploadSchema.safeParse({
      eventId,
      file,
      description,
      orderFulfillmentId,
      emailExtractionId,
    })

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Dados inválidos',
      }
    }

    const timestamp = Date.now()
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `${userData.tenant_id}/events/${eventId}/attachments/${timestamp}_${safeFileName}`

    const { error: uploadError } = await supabase.storage
      .from('event-attachments')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    const { data: attachment, error: dbError } = await supabase
      .from('event_attachments')
      .insert({
        event_id: eventId,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: storagePath,
        description,
        order_fulfillment_id: orderFulfillmentId,
        email_extraction_id: emailExtractionId,
        tenant_id: userData.tenant_id,
        uploaded_by: user.id,
      })
      .select('id')
      .single()

    if (dbError) {
      await supabase.storage.from('event-attachments').remove([storagePath])
      return { success: false, error: dbError.message }
    }

    revalidatePath(`/eventos/${eventId}`)

    return { success: true, documentId: attachment.id }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao fazer upload',
    }
  }
}

export async function uploadPartyDocument(formData: FormData): Promise<DocumentUploadResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { data: userData } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('google_id', user.id)
      .single()

    if (!userData?.tenant_id) {
      return { success: false, error: 'Tenant não encontrado' }
    }

    const partyId = formData.get('partyId') as string
    const file = formData.get('file') as File
    const documentCategory = formData.get('documentCategory') as string
    const title = (formData.get('title') as string) || null
    const description = (formData.get('description') as string) || null
    const documentNumber = (formData.get('documentNumber') as string) || null
    const issueDate = (formData.get('issueDate') as string) || null
    const expiryDate = (formData.get('expiryDate') as string) || null
    const partyRoleId = (formData.get('partyRoleId') as string) || null

    const validation = partyDocumentUploadSchema.safeParse({
      partyId,
      file,
      documentCategory,
      title,
      description,
      documentNumber,
      issueDate,
      expiryDate,
      partyRoleId,
    })

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Dados inválidos',
      }
    }

    const storagePath = `${userData.tenant_id}/${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('party-documents')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    const { data: document, error: dbError } = await supabase
      .from('party_documents')
      .insert({
        party_id: partyId,
        document_category: documentCategory as
          | 'OTHER'
          | 'CONTRACT'
          | 'PROPOSAL'
          | 'INVOICE'
          | 'RECEIPT'
          | 'IDENTITY'
          | 'LICENSE'
          | 'CERTIFICATE',
        file_name: file.name,
        file_path: storagePath,
        file_size_bytes: file.size,
        file_type: file.type,
        title,
        description,
        document_number: documentNumber,
        issue_date: issueDate,
        expiry_date: expiryDate,
        party_role_id: partyRoleId,
        tenant_id: userData.tenant_id,
        uploaded_by: user.id,
      })
      .select('id')
      .single()

    if (dbError) {
      await supabase.storage.from('party-documents').remove([storagePath])
      return { success: false, error: dbError.message }
    }

    return { success: true, documentId: document.id }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao fazer upload',
    }
  }
}
