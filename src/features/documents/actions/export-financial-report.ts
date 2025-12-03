'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { getUserData } from '@/entities/user'
import { getTenantAssets } from '@/entities/tenant'
import { logger } from '@/shared/lib/logger'
import { financialReportExportSchema } from '../schemas'
import { FinancialReportDataService } from '../services/financial-report-data.service'
import { FinancialReportBuilderReactPDF } from '../builders/financial-report-react-pdf-builder'
import type { FinancialReportExportResult } from '../types/financial-report.types'

export async function exportFinancialReport(input: unknown): Promise<FinancialReportExportResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const validation = financialReportExportSchema.safeParse(input)

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Dados inválidos',
      }
    }

    const { eventId, includeServices, includeOrders, includePayments, format } = validation.data
    const { tenant_id } = await getUserData()
    const dataService = new FinancialReportDataService(supabase, tenant_id)
    const reportData = await dataService.generateReportData(eventId)

    if (!reportData) {
      return { success: false, error: 'Evento não encontrado' }
    }

    if (!includeServices) {
      reportData.services = []
    }

    if (!includeOrders) {
      reportData.orders = []
    }

    if (!includePayments) {
      reportData.payments = []
    }

    if (format === 'pdf') {
      const assetsResult = await getTenantAssets()
      const bannerUrl = assetsResult.success ? assetsResult.data?.bannerUrl : undefined

      const builder = new FinancialReportBuilderReactPDF()
      const pdfBytes = await builder.build(reportData, bannerUrl)
      const base64 = Buffer.from(pdfBytes).toString('base64')

      return {
        success: true,
        data: base64,
        mimeType: 'application/pdf',
        fileName: `relatorio-financeiro-${reportData.client.contractName.replace(/\s/g, '-')}.pdf`,
      }
    }

    if (format === 'xlsx') {
      return {
        success: false,
        error: 'Formato XLSX ainda não implementado',
      }
    }

    return {
      success: false,
      error: 'Formato não suportado',
    }
  } catch (error) {
    logger.error('Error exporting financial report', error)
    return {
      success: false,
      error: 'Erro ao exportar relatório financeiro',
    }
  }
}
