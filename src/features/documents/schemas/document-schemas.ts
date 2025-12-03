import { z } from 'zod'
import { DEFAULT_UPLOAD_CONFIG } from '../types'

const MAX_FILE_SIZE = DEFAULT_UPLOAD_CONFIG.maxSizeInMB * 1024 * 1024

const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
]

export const documentFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: `Arquivo deve ter no máximo ${DEFAULT_UPLOAD_CONFIG.maxSizeInMB}MB`,
  })
  .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
    message: 'Formato de arquivo não suportado',
  })

export const documentMetadataSchema = z.object({
  fileName: z.string().min(1, 'Nome do arquivo é obrigatório'),
  fileSize: z.number().positive('Tamanho do arquivo inválido'),
  fileType: z.string().min(1, 'Tipo do arquivo é obrigatório'),
  description: z.string().optional(),
})

export const eventAttachmentUploadSchema = z.object({
  eventId: z.string().uuid('ID do evento inválido'),
  file: documentFileSchema,
  description: z.string().optional(),
  orderFulfillmentId: z.string().uuid().optional(),
  emailExtractionId: z.string().uuid().optional(),
})

export const partyDocumentUploadSchema = z.object({
  partyId: z.string().uuid('ID da parte inválido'),
  file: documentFileSchema,
  documentCategory: z.enum([
    'IDENTITY',
    'ADDRESS',
    'LICENSE',
    'CERTIFICATE',
    'CONTRACT',
    'INVOICE',
    'OTHER',
  ]),
  title: z.string().optional(),
  description: z.string().optional(),
  documentNumber: z.string().optional(),
  issueDate: z.string().date().optional(),
  expiryDate: z.string().date().optional(),
  partyRoleId: z.string().uuid().optional(),
})

export const documentDownloadSchema = z.object({
  storagePath: z.string().min(1, 'Caminho do arquivo é obrigatório'),
  fileName: z.string().min(1, 'Nome do arquivo é obrigatório'),
})

export const documentDeleteSchema = z.object({
  documentId: z.string().uuid('ID do documento inválido'),
  storagePath: z.string().min(1, 'Caminho do arquivo é obrigatório'),
})

export const documentUploadConfigSchema = z.object({
  maxFiles: z.number().positive().optional(),
  maxSizeInMB: z.number().positive().optional(),
  acceptedFormats: z.array(z.string()).optional(),
  allowMultiple: z.boolean().optional(),
})

export const financialReportExportSchema = z.object({
  eventId: z.string().min(1, 'ID do evento é obrigatório'),
  includeServices: z.boolean().default(true),
  includeOrders: z.boolean().default(true),
  includePayments: z.boolean().default(true),
  format: z.enum(['pdf', 'xlsx']).default('pdf'),
})

export type EventAttachmentUploadInput = z.infer<typeof eventAttachmentUploadSchema>
export type PartyDocumentUploadInput = z.infer<typeof partyDocumentUploadSchema>
export type DocumentDownloadInput = z.infer<typeof documentDownloadSchema>
export type DocumentDeleteInput = z.infer<typeof documentDeleteSchema>
export type DocumentUploadConfigInput = z.infer<typeof documentUploadConfigSchema>
export type FinancialReportExportInput = z.infer<typeof financialReportExportSchema>
