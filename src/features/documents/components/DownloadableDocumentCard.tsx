'use client'

import { formatDate } from '@/shared/lib/formatters'
import { formatFileSize, getFileIcon } from '../lib'
import { DocumentActionsMenu } from './DocumentActionsMenu'

interface DownloadableDocumentCardProps {
  id: string
  fileName: string
  fileSize: number
  createdAt?: string | null
  additionalInfo?: string
  onDownload: (id: string) => void
  onDelete?: (id: string) => void
  isDownloading: boolean
}

export function DownloadableDocumentCard({
  id,
  fileName,
  fileSize,
  createdAt,
  additionalInfo,
  onDownload,
  onDelete,
  isDownloading,
}: DownloadableDocumentCardProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex-shrink-0">{getFileIcon(fileName, 'w-5 h-5')}</div>

        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{fileName}</p>

        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="whitespace-nowrap">{formatFileSize(fileSize)}</span>

          {additionalInfo && (
            <>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className="whitespace-nowrap">{additionalInfo}</span>
            </>
          )}

          {createdAt && (
            <>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className="whitespace-nowrap">{formatDate(createdAt)}</span>
            </>
          )}
        </div>
      </div>

      <DocumentActionsMenu
        onDownload={() => onDownload(id)}
        onDelete={onDelete ? () => onDelete(id) : undefined}
        isDownloading={isDownloading}
      />
    </div>
  )
}
