'use client'

import Image from 'next/image'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { formatFileSize, getFileIcon } from '../lib'
import type { DocumentFile } from '../types'

interface DocumentCardProps {
  document: DocumentFile
  onRemove?: (id: string) => void
  showRemove?: boolean
}

export function DocumentCard({ document, onRemove, showRemove = true }: DocumentCardProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {document.preview ? (
          <Image
            src={document.preview}
            alt={document.file.name}
            width={20}
            height={20}
            className="w-5 h-5 object-cover rounded flex-shrink-0"
            unoptimized
          />
        ) : (
          <div className="flex-shrink-0">{getFileIcon(document.file.name, 'w-5 h-5')}</div>
        )}

        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {document.file.name}
        </p>

        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="whitespace-nowrap">{formatFileSize(document.file.size)}</span>
        </div>
      </div>

      {showRemove && onRemove && (
        <button
          type="button"
          onClick={() => onRemove(document.id)}
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
          aria-label="Remover arquivo"
        >
          <XMarkIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
      )}
    </div>
  )
}
