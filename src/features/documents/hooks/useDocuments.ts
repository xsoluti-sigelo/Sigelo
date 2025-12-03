'use client'

import { useState, useCallback } from 'react'
import { useDocumentUpload } from './useDocumentUpload'
import { useDocumentDownload } from './useDocumentDownload'
import type { DocumentUploadConfig } from '../types'

interface UseDocumentsProps {
  uploadConfig?: DocumentUploadConfig
  onUploadSuccess?: (documentId: string) => void
  onDownloadSuccess?: (fileName: string) => void
  onError?: (error: string) => void
}

export function useDocuments(props?: UseDocumentsProps) {
  const { uploadConfig, onUploadSuccess, onDownloadSuccess, onError } = props ?? {}

  const [isUploading, setIsUploading] = useState(false)

  const upload = useDocumentUpload({
    config: uploadConfig,
    onError,
  })

  const download = useDocumentDownload({
    onSuccess: onDownloadSuccess,
    onError,
  })

  const handleUploadComplete = useCallback(
    (documentId: string) => {
      setIsUploading(false)
      onUploadSuccess?.(documentId)
    },
    [onUploadSuccess],
  )

  const handleUploadError = useCallback(
    (error: string) => {
      setIsUploading(false)
      onError?.(error)
    },
    [onError],
  )

  return {
    upload: {
      ...upload,
      isUploading,
      setIsUploading,
      onComplete: handleUploadComplete,
      onError: handleUploadError,
    },
    download,
  }
}
