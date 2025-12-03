'use client'

import { useState, useCallback, useMemo } from 'react'
import type { DocumentFile, DocumentUploadConfig, UploadProgress } from '../types'
import { createDocumentFile, revokeDocumentPreview } from '../lib'
import { DocumentValidatorService } from '../services'

interface UseDocumentUploadProps {
  config?: DocumentUploadConfig
  existingFilesCount?: number
  onFilesChange?: (files: DocumentFile[]) => void
  onError?: (error: string) => void
}

export function useDocumentUpload(props?: UseDocumentUploadProps) {
  const { config, existingFilesCount = 0, onFilesChange, onError } = props ?? {}

  const [files, setFiles] = useState<DocumentFile[]>([])
  const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgress>>(new Map())
  const [isDragging, setIsDragging] = useState(false)

  const validator = useMemo(() => new DocumentValidatorService(config), [config])

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const countError = validator.validateFileCount(
        files.length + existingFilesCount,
        newFiles.length,
      )

      if (countError) {
        onError?.(countError)
        return
      }

      const { valid, invalid } = validator.validateFiles(newFiles)

      if (invalid.length > 0) {
        const errorMessages = invalid.map((item) => `${item.file.name}: ${item.error}`)
        onError?.(errorMessages.join('\n'))
      }

      if (valid.length > 0) {
        const documentFiles = valid.map(createDocumentFile)
        const updatedFiles = [...files, ...documentFiles]
        setFiles(updatedFiles)
        onFilesChange?.(updatedFiles)
      }
    },
    [files, existingFilesCount, validator, onError, onFilesChange],
  )

  const removeFile = useCallback(
    (fileId: string) => {
      const file = files.find((f) => f.id === fileId)
      if (file) {
        revokeDocumentPreview(file)
      }

      const updatedFiles = files.filter((f) => f.id !== fileId)
      setFiles(updatedFiles)
      onFilesChange?.(updatedFiles)
    },
    [files, onFilesChange],
  )

  const clearFiles = useCallback(() => {
    files.forEach(revokeDocumentPreview)
    setFiles([])
    onFilesChange?.([])
  }, [files, onFilesChange])

  const updateProgress = useCallback((fileId: string, progress: Partial<UploadProgress>) => {
    setUploadProgress((prev) => {
      const newMap = new Map(prev)
      const current = newMap.get(fileId) ?? {
        id: fileId,
        progress: 0,
        status: 'pending' as const,
      }
      newMap.set(fileId, { ...current, ...progress })
      return newMap
    })
  }, [])

  const getProgress = useCallback(
    (fileId: string): UploadProgress | undefined => {
      return uploadProgress.get(fileId)
    },
    [uploadProgress],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const droppedFiles = Array.from(e.dataTransfer.files)
      addFiles(droppedFiles)
    },
    [addFiles],
  )

  return {
    files,
    isDragging,
    uploadProgress,
    addFiles,
    removeFile,
    clearFiles,
    updateProgress,
    getProgress,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    validator,
  }
}
