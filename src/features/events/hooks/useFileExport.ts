'use client'

import { useState } from 'react'
import { showSuccessToast, showErrorToast } from '@/shared/lib/toast'
import { base64ToBlob, downloadBlob } from '@/shared/lib/file-utils'

export type ExportFormat = 'pdf'

interface ExportResult {
  success: boolean
  data?: string
  error?: string
}

interface UseFileExportOptions {
  fileName: string
  onSuccess?: (format: ExportFormat) => void
  onError?: (format: ExportFormat, error: string) => void
}

const MIME_TYPES: Record<ExportFormat, string> = {
  pdf: 'application/pdf',
}

export function useFileExport({ fileName, onSuccess, onError }: UseFileExportOptions) {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null)

  const downloadFile = (base64Data: string, format: ExportFormat) => {
    const mimeType = MIME_TYPES[format]
    const formattedFileName = `${fileName}-${new Date().toISOString().split('T')[0]}.${format}`
    const blob = base64ToBlob(base64Data, mimeType)
    downloadBlob(blob, formattedFileName)
  }

  const handleExport = async (
    format: ExportFormat,
    exportFn: () => Promise<ExportResult>,
  ): Promise<void> => {
    setIsExporting(format)

    try {
      const result = await exportFn()

      if (result.success && result.data) {
        downloadFile(result.data, format)
        showSuccessToast('Relatório exportado como PDF')
        onSuccess?.(format)
      } else {
        const errorMessage = result.error || 'Erro ao exportar PDF'
        showErrorToast(errorMessage)
        onError?.(format, errorMessage)
      }
    } catch {
      const errorMessage = 'Erro ao exportar PDF'
      showErrorToast(errorMessage)
      onError?.(format, errorMessage)
    } finally {
      setIsExporting(null)
    }
  }

  return {
    isExporting,
    handleExport,
    isExportingFormat: (format: ExportFormat) => isExporting === format,
    isAnyExporting: isExporting !== null,
  }
}
