'use client'

import { Button } from '@/shared/ui'
import { ArrowDownTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { useFinancialReportExport } from '../hooks/useFinancialReportExport'

interface FinancialReportExportButtonProps {
  eventId: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  children?: React.ReactNode
}

export function FinancialReportExportButton({
  eventId,
  variant = 'outline',
  size = 'md',
  showIcon = true,
  children,
}: FinancialReportExportButtonProps) {
  const { isExporting, exportPDF } = useFinancialReportExport()

  const handleExport = async () => {
    await exportPDF(eventId)
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting}
      isLoading={isExporting}
    >
      {showIcon && <ArrowDownTrayIcon className="w-4 h-4 mr-2" />}
      {children || 'Exportar relatório financeiro'}
    </Button>
  )
}

export function FinancialReportExportIconButton({ eventId }: { eventId: string }) {
  const { isExporting, exportPDF } = useFinancialReportExport()

  const handleExport = async () => {
    await exportPDF(eventId)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      isLoading={isExporting}
      title="Exportar relatório financeiro"
    >
      <DocumentTextIcon className="w-5 h-5" />
    </Button>
  )
}

export function FinancialReportExportButtons({ eventId }: { eventId: string }) {
  const { isExporting, exportPDF, exportXLSX } = useFinancialReportExport()

  return (
    <div className="flex gap-3 flex-wrap">
      <Button
        variant="outline"
        onClick={() => exportPDF(eventId)}
        disabled={isExporting}
        isLoading={isExporting}
      >
        <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
        Exportar PDF
      </Button>
      <Button
        variant="outline"
        onClick={() => exportXLSX(eventId)}
        disabled={isExporting}
        isLoading={isExporting}
      >
        <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
        Exportar Excel
      </Button>
    </div>
  )
}
