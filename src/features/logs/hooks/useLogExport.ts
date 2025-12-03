'use client'

import { useState, useCallback } from 'react'
import type { ActivityLog, LogExportOptions } from '../types'
import { LogExportService } from '../services'
import { toast } from 'sonner'

export function useLogExport() {
  const [isExporting, setIsExporting] = useState(false)

  const exportLogs = useCallback(async (logs: ActivityLog[], options: LogExportOptions) => {
    setIsExporting(true)
    try {
      LogExportService.export(logs, options)
      toast.success(`Logs exportados com sucesso em formato ${options.format.toUpperCase()}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao exportar logs'
      toast.error(message)
    } finally {
      setIsExporting(false)
    }
  }, [])

  const exportAsCSV = useCallback(
    async (logs: ActivityLog[], includeUserInfo = true) => {
      await exportLogs(logs, {
        format: 'csv',
        includeUserInfo,
      })
    },
    [exportLogs],
  )

  const exportAsJSON = useCallback(
    async (logs: ActivityLog[], includeUserInfo = true) => {
      await exportLogs(logs, {
        format: 'json',
        includeUserInfo,
      })
    },
    [exportLogs],
  )

  return {
    isExporting,
    exportLogs,
    exportAsCSV,
    exportAsJSON,
  }
}
