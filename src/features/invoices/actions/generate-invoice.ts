'use server'

import { getUserData } from '@/entities/user'
import { NewEventInvoiceGeneratorService } from '../services/invoice-generator.service'
import type { InvoiceGenerationParams, InvoiceGenerationResult } from '@/entities/new-event-invoice/model/types'
import { logger } from '@/shared/lib/logger'

export async function generateNewEventInvoice(
  params: InvoiceGenerationParams,
): Promise<InvoiceGenerationResult> {
  try {
    const { tenant_id, id: userId } = await getUserData()

    logger.info('Generating invoice for new_event', { params, userId, tenantId: tenant_id })

    const service = new NewEventInvoiceGeneratorService(tenant_id, userId)
    const result = await service.generateInvoice(params)

    if (result.success) {
      logger.info('Invoice generation successful', {
        eventId: params.eventId,
        invoicesCount: result.invoices?.length,
        strategy: params.strategy,
        ofNumbers: result.invoices?.flatMap((inv) => inv.ofNumbers) || [],
      })
    } else {
      logger.error('Invoice generation failed', {
        eventId: params.eventId,
        error: result.error,
      })
    }

    return result
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erro desconhecido ao gerar fatura'
    logger.error('Unexpected error in generateNewEventInvoice', { error: errorMessage, params })

    return {
      success: false,
      error: errorMessage,
    }
  }
}
