import { createClient } from '@/shared/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import { fileToBase64 } from '../lib'

export interface UploadOptions {
  tenantId: string
  folder: 'event-attachments' | 'party-documents' | 'tenant-attachments'
  file: File
  onProgress?: (progress: number) => void
}

export interface DownloadOptions {
  storagePath: string
}

export class DocumentStorageService {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient()
  }

  async upload(options: UploadOptions): Promise<{ storagePath: string; error?: string }> {
    const { tenantId, folder, file, onProgress } = options

    try {
      const bucketName = folder
      const storagePath = `${tenantId}/${file.name}`

      onProgress?.(30)

      const { error: uploadError } = await this.supabase.storage
        .from(bucketName)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: folder === 'tenant-attachments',
        })

      if (uploadError) {
        return { storagePath: '', error: uploadError.message }
      }

      onProgress?.(100)

      return { storagePath }
    } catch (error) {
      return {
        storagePath: '',
        error: error instanceof Error ? error.message : 'Erro ao fazer upload',
      }
    }
  }

  async download(
    options: DownloadOptions & { bucket: string },
  ): Promise<{ data?: string; error?: string }> {
    const { storagePath, bucket } = options

    try {
      const { data, error } = await this.supabase.storage.from(bucket).download(storagePath)

      if (error) {
        return { error: error.message }
      }

      if (!data) {
        return { error: 'Arquivo não encontrado' }
      }

      const base64Data = await fileToBase64(data)
      return { data: base64Data }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Erro ao baixar arquivo',
      }
    }
  }

  async delete(storagePath: string, bucket: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.storage.from(bucket).remove([storagePath])

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao deletar arquivo',
      }
    }
  }

  async exists(storagePath: string, bucket: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .list(storagePath.split('/').slice(0, -1).join('/'))

      if (error) return false

      const fileName = storagePath.split('/').pop()
      return data?.some((file) => file.name === fileName) ?? false
    } catch {
      return false
    }
  }
}
