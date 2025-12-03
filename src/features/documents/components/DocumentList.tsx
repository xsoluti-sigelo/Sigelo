'use client'

import { DocumentCard } from './DocumentCard'
import type { DocumentFile } from '../types'

interface DocumentListProps {
  documents: DocumentFile[]
  maxFiles?: number
  existingFilesCount?: number
  onRemove?: (id: string) => void
  showRemove?: boolean
  emptyMessage?: string
}

export function DocumentList({
  documents,
  maxFiles = 5,
  existingFilesCount = 0,
  onRemove,
  showRemove = true,
  emptyMessage = 'Nenhum arquivo selecionado',
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  const totalFiles = existingFilesCount + documents.length

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Arquivos anexados ({totalFiles}/{maxFiles})
      </p>

      <div className="space-y-2">
        {documents.map((doc) => (
          <DocumentCard key={doc.id} document={doc} onRemove={onRemove} showRemove={showRemove} />
        ))}
      </div>
    </div>
  )
}
