'use client'

import { useRef } from 'react'
import { Button } from '@/shared/ui'
import { ArrowUpTrayIcon, PaperClipIcon } from '@heroicons/react/24/outline'
import { DocumentList } from './DocumentList'
import { useDocumentUpload } from '../hooks'
import type { DocumentUploadConfig } from '../types'

interface DocumentUploadZoneProps {
  config?: DocumentUploadConfig
  label?: string
  helperText?: string
  onFilesChange?: (files: File[]) => void
  className?: string
  existingFilesCount?: number
}

export function DocumentUploadZone({
  config,
  label,
  helperText = 'Arraste arquivos ou clique para selecionar',
  onFilesChange,
  className = '',
  existingFilesCount = 0,
}: DocumentUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    files,
    isDragging,
    addFiles,
    removeFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    validator,
  } = useDocumentUpload({
    config,
    existingFilesCount,
    onFilesChange: (documentFiles) => {
      onFilesChange?.(documentFiles.map((df) => df.file))
    },
  })

  const handleFileSelect = (fileList: FileList | null) => {
    if (fileList) {
      addFiles(Array.from(fileList))
    }
  }

  const maxSizeInMB = config?.maxSizeInMB ?? 10

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}

        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
            ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={config?.allowMultiple ?? true}
            accept={validator.getAcceptedFormatsString()}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{helperText}</p>

          <Button type="button" variant="secondary" size="sm">
            <PaperClipIcon className="w-4 h-4 mr-2" />
            Selecionar Arquivos
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG
            <br />
            Tamanho máximo: {maxSizeInMB}MB por arquivo
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <DocumentList
          documents={files}
          maxFiles={config?.maxFiles ?? 5}
          existingFilesCount={existingFilesCount}
          onRemove={removeFile}
          showRemove
        />
      )}
    </div>
  )
}
