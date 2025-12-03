import type { DocumentFile } from '../types'
import { MIME_TYPE_MAP } from '../types'

export {
  base64ToBlob,
  downloadBlob,
  downloadBase64File,
  fileToBase64,
  getFileExtension,
  isImageFile,
  isPdfFile,
  validateFileSize,
  validateFileType,
} from '@/shared/lib/file-utils'

import { getFileExtension } from '@/shared/lib/file-utils'

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getMimeType(fileName: string): string {
  const extension = getFileExtension(fileName)
  return MIME_TYPE_MAP[extension] || 'application/octet-stream'
}

export function createDocumentFile(file: File): DocumentFile {
  return {
    file,
    id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
    preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
  }
}

export function revokeDocumentPreview(document: DocumentFile): void {
  if (document.preview) {
    URL.revokeObjectURL(document.preview)
  }
}

export function isDocumentFile(fileName: string): boolean {
  const extension = getFileExtension(fileName)
  return ['doc', 'docx'].includes(extension)
}

export function isSpreadsheetFile(fileName: string): boolean {
  const extension = getFileExtension(fileName)
  return ['xls', 'xlsx'].includes(extension)
}

export function generateStoragePath(
  tenantId: string,
  folder: 'event-attachments' | 'party-documents',
  fileName: string,
  eventId?: string,
): string {
  const timestamp = Date.now()
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')

  if (folder === 'event-attachments' && eventId) {
    return `${tenantId}/events/${eventId}/attachments/${timestamp}_${sanitizedFileName}`
  }

  return `${tenantId}/${folder}/${timestamp}-${sanitizedFileName}`
}
