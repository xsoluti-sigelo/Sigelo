import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { createLogger } from '../utils/logger.ts'
import { GmailAttachment } from './gmail-reader.service.ts'

const logger = createLogger({ service: 'AttachmentStorageService' })

const BUCKET_NAME = 'event-attachments'

export interface StoredAttachment {
  filename: string
  storagePath: string
  mimeType: string
  size: number
  publicUrl?: string
}

export class AttachmentStorageService {
  constructor(
    private supabase: SupabaseClient,
    private tenantId: string,
  ) {}

  /**
   * Salva um anexo no Supabase Storage
   * Path: {tenantId}/emails/{eventId}/of_{ofNumber}/of_{ofNumber}_{randomId}.{ext}
   */
  async saveAttachment(
    eventId: string,
    ofNumber: string,
    attachment: GmailAttachment,
    content: Uint8Array,
  ): Promise<StoredAttachment | null> {
    try {
      const extension = this.getFileExtension(attachment.filename)
      const randomId = this.generateRandomId()
      const filename = `of_${ofNumber}_${randomId}.${extension}`
      const storagePath = `${this.tenantId}/emails/${eventId}/of_${ofNumber}/${filename}`

      logger.info('Salvando anexo no storage', {
        storagePath,
        mimeType: attachment.mimeType,
        size: content.length,
      })

      const { error } = await this.supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, content, {
          contentType: attachment.mimeType,
          upsert: true,
        })

      if (error) {
        logger.error('Erro ao fazer upload do anexo', { error, storagePath })
        return null
      }

      const {
        data: { publicUrl },
      } = this.supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath)

      logger.info('Anexo salvo com sucesso', { storagePath, publicUrl })

      return {
        filename: attachment.filename,
        storagePath,
        mimeType: attachment.mimeType,
        size: content.length,
        publicUrl,
      }
    } catch (error) {
      logger.error('Erro ao salvar anexo', error)
      return null
    }
  }

  /**
   * Salva múltiplos anexos
   */
  async saveAttachments(
    eventId: string,
    ofNumber: string,
    attachments: Array<{ attachment: GmailAttachment; content: Uint8Array }>,
  ): Promise<StoredAttachment[]> {
    const results: StoredAttachment[] = []

    for (const { attachment, content } of attachments) {
      const stored = await this.saveAttachment(eventId, ofNumber, attachment, content)
      if (stored) {
        results.push(stored)
      }
    }

    logger.info(`${results.length}/${attachments.length} anexos salvos`)
    return results
  }

  /**
   * Remove anexos de uma O.F.
   */
  async deleteAttachments(eventId: string, ofNumber: string): Promise<boolean> {
    try {
      const folderPath = `${this.tenantId}/emails/${eventId}/of_${ofNumber}`

      const { data: files, error: listError } = await this.supabase.storage
        .from(BUCKET_NAME)
        .list(folderPath)

      if (listError) {
        logger.error('Erro ao listar anexos para deletar', listError)
        return false
      }

      if (!files || files.length === 0) {
        logger.info('Nenhum anexo para deletar', { folderPath })
        return true
      }

      const filePaths = files.map((f) => `${folderPath}/${f.name}`)
      const { error: deleteError } = await this.supabase.storage
        .from(BUCKET_NAME)
        .remove(filePaths)

      if (deleteError) {
        logger.error('Erro ao deletar anexos', deleteError)
        return false
      }

      logger.info(`${filePaths.length} anexos deletados`, { folderPath })
      return true
    } catch (error) {
      logger.error('Erro ao deletar anexos', error)
      return false
    }
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase()
  }

  private getFileExtension(filename: string): string {
    const parts = filename.split('.')
    if (parts.length > 1) {
      return parts[parts.length - 1].toLowerCase()
    }
    return 'bin'
  }

  private generateRandomId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}
