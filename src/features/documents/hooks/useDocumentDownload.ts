'use client'

import { useState, useCallback } from 'react'
import { showErrorToast, showSuccessToast } from '@/shared/lib/toast'
import { downloadBase64File, getMimeType } from '../lib'
import type { DocumentDownloadResult } from '../types'

interface UseDocumentDownloadOptions {
  onSuccess?: (fileName: string) => void
  onError?: (error: string) => void
}

export function useDocumentDownload(options?: UseDocumentDownloadOptions) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const downloadFile = useCallback(
    async (fileName: string, base64Data: string, mimeType?: string) => {
      const finalMimeType = mimeType || getMimeType(fileName)
      downloadBase64File(base64Data, fileName, finalMimeType)
    },
    [],
  )

  const handleDownload = useCallback(
    async <T extends { storagePath: string; fileName: string }>(
      params: T,
      downloadFn: (params: T) => Promise<DocumentDownloadResult>,
      itemId: string,
    ): Promise<void> => {
      try {
        setDownloadingId(itemId)
        const result = await downloadFn(params)

        if (!result.success) {
          const errorMessage = result.error || 'Erro ao baixar arquivo'
          showErrorToast(errorMessage)
          options?.onError?.(errorMessage)
          return
        }

        if (result.data) {
          await downloadFile(params.fileName, result.data, result.mimeType)
          showSuccessToast(`${params.fileName} baixado com sucesso`)
          options?.onSuccess?.(params.fileName)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao baixar arquivo'
        showErrorToast(errorMessage)
        options?.onError?.(errorMessage)
      } finally {
        setDownloadingId(null)
      }
    },
    [downloadFile, options],
  )

  const isDownloading = useCallback((itemId: string) => downloadingId === itemId, [downloadingId])

  return {
    downloadingId,
    handleDownload,
    downloadFile,
    isDownloading,
    isAnyDownloading: downloadingId !== null,
  }
}
