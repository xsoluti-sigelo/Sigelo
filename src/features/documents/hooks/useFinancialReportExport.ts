'use client'

import { useState, useCallback } from 'react'
import { showErrorToast, showSuccessToast } from '@/shared/lib/toast'
import { downloadBase64File } from '../lib'
import { exportFinancialReport } from '../actions/export-financial-report'
import type { FinancialReportExportOptions } from '../types/financial-report.types'

interface UseFinancialReportExportOptions {
  onSuccess?: (fileName: string) => void
  onError?: (error: string) => void
}

export function useFinancialReportExport(options?: UseFinancialReportExportOptions) {
  const [isExporting, setIsExporting] = useState(false)

  const exportReport = useCallback(
    async (exportOptions: FinancialReportExportOptions): Promise<void> => {
      try {
        setIsExporting(true)

        const result = await exportFinancialReport(exportOptions)

        if (!result.success) {
          const errorMessage = result.error || 'Erro ao exportar relatório'
          showErrorToast(errorMessage)
          options?.onError?.(errorMessage)
          return
        }

        if (result.data && result.fileName && result.mimeType) {
          downloadBase64File(result.data, result.fileName, result.mimeType)
          showSuccessToast('Relatório exportado com sucesso')
          options?.onSuccess?.(result.fileName)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao exportar relatório'
        showErrorToast(errorMessage)
        options?.onError?.(errorMessage)
      } finally {
        setIsExporting(false)
      }
    },
    [options],
  )

  const exportPDF = useCallback(
    async (eventId: string) => {
      return exportReport({
        eventId,
        includeServices: true,
        includeOrders: true,
        includePayments: true,
        format: 'pdf',
      })
    },
    [exportReport],
  )

  const exportXLSX = useCallback(
    async (eventId: string) => {
      return exportReport({
        eventId,
        includeServices: true,
        includeOrders: true,
        includePayments: true,
        format: 'xlsx',
      })
    },
    [exportReport],
  )

  return {
    isExporting,
    exportReport,
    exportPDF,
    exportXLSX,
  }
}
