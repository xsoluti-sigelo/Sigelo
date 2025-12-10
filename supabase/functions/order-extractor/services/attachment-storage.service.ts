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
   */
  async saveAttachment(
    eventId: string,
    emailId: string,
    attachment: GmailAttachment,
    content: Uint8Array,
  ): Promise<StoredAttachment | null> {
    try {
      // Sanitizar filename para evitar problemas
      const safeFilename = this.sanitizeFilename(attachment.filename)
      const storagePath = `${this.tenantId}/emails/${eventId}/${emailId}/${safeFilename}`

      logger.info('Salvando anexo no storage', {
        storagePath,
        mimeType: attachment.mimeType,
        size: content.length,
      })

      // Upload para o bucket
      const { data, error } = await this.supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, content, {
          contentType: attachment.mimeType,
          upsert: true, // Substituir se já existir
        })

      if (error) {
        logger.error('Erro ao fazer upload do anexo', {
          error,
          storagePath,
        })
        return null
      }

      // Obter URL pública (bucket é público)
      const {
        data: { publicUrl },
      } = this.supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath)

      logger.info('Anexo salvo com sucesso', {
        storagePath,
        publicUrl,
      })

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
    emailId: string,
    attachments: Array<{ attachment: GmailAttachment; content: Uint8Array }>,
  ): Promise<StoredAttachment[]> {
    const results: StoredAttachment[] = []

    for (const { attachment, content } of attachments) {
      const stored = await this.saveAttachment(eventId, emailId, attachment, content)
      if (stored) {
        results.push(stored)
      }
    }

    logger.info(`${results.length}/${attachments.length} anexos salvos`)
    return results
  }

  /**
   * Remove anexos de um email
   */
  async deleteAttachments(eventId: string, emailId: string): Promise<boolean> {
    try {
      const folderPath = `${this.tenantId}/emails/${eventId}/${emailId}`

      // Listar arquivos na pasta
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

      // Deletar cada arquivo
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

  /**
   * Sanitiza o nome do arquivo para evitar problemas no storage
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Substitui caracteres especiais
      .replace(/_+/g, '_') // Remove underscores duplicados
      .toLowerCase()
  }
}
