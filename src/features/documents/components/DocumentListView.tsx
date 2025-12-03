'use client'

import { PaperClipIcon } from '@heroicons/react/24/outline'
import { DownloadableDocumentCard } from './DownloadableDocumentCard'

interface Document {
  id: string
  fileName: string
  fileSize: number
  storagePath: string
  createdAt?: string | null
  additionalInfo?: string
}

interface DocumentListViewProps {
  documents: Document[]
  onDownload: (storagePath: string, fileName: string, id: string) => void
  onDelete?: (id: string, storagePath: string) => void
  isDownloading: (id: string) => boolean
  emptyTitle?: string
  emptyDescription?: string
}

export function DocumentListView({
  documents,
  onDownload,
  onDelete,
  isDownloading,
  emptyTitle = 'Nenhum documento encontrado',
  emptyDescription = 'Documentos anexados serão exibidos aqui',
}: DocumentListViewProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <PaperClipIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400 mb-2">{emptyTitle}</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <DownloadableDocumentCard
          key={doc.id}
          id={doc.id}
          fileName={doc.fileName}
          fileSize={doc.fileSize}
          createdAt={doc.createdAt}
          additionalInfo={doc.additionalInfo}
          onDownload={(id) => onDownload(doc.storagePath, doc.fileName, id)}
          onDelete={onDelete ? (id) => onDelete(id, doc.storagePath) : undefined}
          isDownloading={isDownloading(doc.id)}
        />
      ))}
    </div>
  )
}
