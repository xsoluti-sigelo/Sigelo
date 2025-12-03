'use client'

import { Card } from '@/shared/ui'
import { downloadAttachment, downloadInvoice } from '@/features/events/actions'
import { DocumentListView } from '@/features/documents/components'
import { useDocumentDownload } from '@/features/documents/hooks'
import { EventAttachment } from './types'

interface AttachmentsTabProps {
  attachments: EventAttachment[]
  invoices?: Array<{
    id: string
    invoice_id_conta_azul: string | null
    invoice_number: number | null
    of_numbers: string[] | null
    created_at: string
    success: boolean
    invoice_path: string | null
  }>
}

export function AttachmentsTab({ attachments, invoices = [] }: AttachmentsTabProps) {
  const { handleDownload, isDownloading } = useDocumentDownload()

  const onDownloadAttachment = (storagePath: string, fileName: string, id: string) => {
    handleDownload({ storagePath, fileName }, downloadAttachment, id)
  }

  const onDownloadInvoice = (storagePath: string, fileName: string, id: string) => {
    handleDownload({ storagePath, fileName }, downloadInvoice, id)
  }

  const formattedAttachments = attachments.map((attachment) => ({
    id: attachment.id,
    fileName: attachment.file_name,
    fileSize: attachment.file_size,
    storagePath: attachment.storage_path,
    createdAt: attachment.created_at,
    additionalInfo: attachment.order_fulfillments
      ? `O.F. ${attachment.order_fulfillments.of_number}`
      : undefined,
    type: 'attachment' as const,
  }))

  const formattedInvoices = invoices
    .filter((invoice) => invoice.invoice_path)
    .map((invoice) => {
      const invoiceNumber = invoice.invoice_number
        ? `NF #${invoice.invoice_number.toString().padStart(6, '0')}`
        : 'Fatura'
      const ofInfo =
        invoice.of_numbers && invoice.of_numbers.length > 0
          ? `O.F. ${invoice.of_numbers.join(', ')}`
          : undefined

      return {
        id: invoice.id,
        fileName: `${invoiceNumber}.pdf`,
        fileSize: 0,
        storagePath: invoice.invoice_path!,
        createdAt: invoice.created_at,
        additionalInfo: ofInfo,
        type: 'invoice' as const,
      }
    })

  const allDocuments = [...formattedAttachments, ...formattedInvoices].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return dateB - dateA
  })

  const onDownload = (storagePath: string, fileName: string, id: string, type?: string) => {
    if (type === 'invoice') {
      onDownloadInvoice(storagePath, fileName, id)
    } else {
      onDownloadAttachment(storagePath, fileName, id)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-200 dark:border-gray-700 mb-6">
        Anexos e Faturas do evento
      </h2>

      <DocumentListView
        documents={allDocuments.map((doc) => ({
          id: doc.id,
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          storagePath: doc.storagePath,
          createdAt: doc.createdAt,
          additionalInfo: doc.additionalInfo,
        }))}
        onDownload={(storagePath, fileName, id) => {
          const doc = allDocuments.find((d) => d.id === id)
          onDownload(storagePath, fileName, id, doc?.type)
        }}
        isDownloading={isDownloading}
        emptyTitle="Nenhum anexo ou fatura encontrado"
        emptyDescription="Anexos de e-mails processados e faturas geradas serão exibidos aqui"
      />
    </Card>
  )
}
