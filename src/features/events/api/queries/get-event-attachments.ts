import { createClient } from '@/shared/lib/supabase/server'

export interface EventAttachment {
  id: string
  file_name: string
  file_type: string
  file_size: number
  storage_path: string
  public_url: string
  source: 'database' | 'email'
  created_at: string
}

interface DbAttachment {
  id: string
  file_name: string
  file_type: string
  file_size: number
  storage_path: string
  created_at: string
}

export async function getEventAttachments(eventId: string): Promise<EventAttachment[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('google_id', user.id)
    .single()

  if (!userData?.tenant_id) {
    throw new Error('Tenant not found')
  }

  const allAttachments: EventAttachment[] = []

  if (!eventId.startsWith('event-')) {
    const { data: dbAttachments } = await supabase
      .from('event_attachments' as never)
      .select(
        `
        id,
        file_name,
        file_type,
        file_size,
        storage_path,
        created_at
      `,
      )
      .eq('event_id', eventId)
      .eq('tenant_id', userData.tenant_id)
      .order('created_at', { ascending: false })

    if (dbAttachments) {
      for (const att of dbAttachments as DbAttachment[]) {
        const { data: urlData } = supabase.storage
          .from('event-attachments')
          .getPublicUrl(att.storage_path)

        allAttachments.push({
          id: att.id,
          file_name: att.file_name,
          file_type: att.file_type,
          file_size: att.file_size,
          storage_path: att.storage_path,
          public_url: urlData.publicUrl,
          source: 'database',
          created_at: att.created_at,
        })
      }
    }
  }

  const emailsPath = `${userData.tenant_id}/emails/${eventId}`
  console.log('[getEventAttachments] emailsPath:', emailsPath)

  const { data: emailFolders, error: listError } = await supabase.storage
    .from('event-attachments')
    .list(emailsPath)

  console.log('[getEventAttachments] emailFolders:', emailFolders?.length, 'error:', listError)

  if (emailFolders && emailFolders.length > 0) {
    for (const item of emailFolders) {
      const isFile = item.name.includes('.')
      if (isFile) continue

      const folderPath = `${emailsPath}/${item.name}`
      const { data: files } = await supabase.storage
        .from('event-attachments')
        .list(folderPath)

      if (files) {
        for (const file of files) {
          if (!file.name.includes('.')) continue

          const storagePath = `${folderPath}/${file.name}`
          const { data: urlData } = supabase.storage
            .from('event-attachments')
            .getPublicUrl(storagePath)

          // Extrair número da O.F. do nome da pasta (of_XXXXXXXX -> XXXXXXXX)
          const ofNumber = item.name.startsWith('of_') ? item.name.slice(3) : item.name

          allAttachments.push({
            id: `email-${ofNumber}-${file.name}`,
            file_name: file.name,
            file_type: file.metadata?.mimetype || 'application/pdf',
            file_size: file.metadata?.size || 0,
            storage_path: storagePath,
            public_url: urlData.publicUrl,
            source: 'email',
            created_at: file.created_at || new Date().toISOString(),
          })
        }
      }
    }
  }

  allAttachments.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return allAttachments
}
