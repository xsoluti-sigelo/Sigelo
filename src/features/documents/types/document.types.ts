import type { Database } from '@/types/database.types'

export type EventAttachment = Database['public']['Tables']['event_attachments']['Row']
export type EventAttachmentInsert = Database['public']['Tables']['event_attachments']['Insert']
export type EventAttachmentUpdate = Database['public']['Tables']['event_attachments']['Update']

export type PartyDocument = Database['public']['Tables']['party_documents']['Row']
export type PartyDocumentInsert = Database['public']['Tables']['party_documents']['Insert']
export type PartyDocumentUpdate = Database['public']['Tables']['party_documents']['Update']

export type DocumentCategory = Database['public']['Enums']['document_category']

export interface DocumentFile {
  file: File
  id: string
  preview?: string
}

export interface UploadProgress {
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export interface DocumentUploadResult {
  success: boolean
  documentId?: string
  error?: string
}

export interface DocumentDownloadResult {
  success: boolean
  data?: string
  mimeType?: string
  error?: string
}

export interface DocumentMetadata {
  fileName: string
  fileSize: number
  fileType: string
  description?: string
}

export interface DocumentUploadConfig {
  maxFiles?: number
  maxSizeInMB?: number
  acceptedFormats?: string[]
  allowMultiple?: boolean
}

export const DEFAULT_UPLOAD_CONFIG: Required<DocumentUploadConfig> = {
  maxFiles: 5,
  maxSizeInMB: 10,
  acceptedFormats: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg'],
  allowMultiple: true,
}

export const MIME_TYPE_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
}
