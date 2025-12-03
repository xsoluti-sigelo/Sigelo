/**
 * HANDLERS PARA PROCESSAMENTO DE EMAILS
 *
 * Endpoints para processamento de emails individuais e em lote
 */

import { createLogger } from '../utils/logger.ts'
import {
  EmailProcessingService,
  EmailProcessingRequest,
  EmailProcessingResult,
} from '../services/email-processing.service.ts'
import { env } from '../config/environment.ts'

const logger = createLogger({ service: 'EmailProcessingHandlers' })

// ============================================================================
// HANDLER PARA PROCESSAMENTO DE EMAIL INDIVIDUAL
// ============================================================================

export async function handleProcessEmail(
  supabase: any,
  request: Request,
  supabaseUrl: string,
  serviceRoleKey: string,
  googleMapsApiKey?: string,
): Promise<Response> {
  try {
    logger.info('Processando email individual')

    const body = await request.json()
    const { userId, emailId, subject, sender, receivedAt, rawContent } = body

    // Validação dos parâmetros obrigatórios
    if (!userId || !emailId || !subject || !sender || !receivedAt || !rawContent) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            'Parâmetros obrigatórios ausentes: userId, emailId, subject, sender, receivedAt, rawContent',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    // Cria serviço de processamento
    const processingService = new EmailProcessingService(
      supabase,
      supabaseUrl,
      serviceRoleKey,
      googleMapsApiKey ?? '',
      env.app.defaultTenantId,
    )

    // Processa o email
    const result = await processingService.processEmail({
      userId,
      emailId,
      subject,
      sender,
      receivedAt,
      rawContent,
    })

    // Retorna resultado
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
      status: result.success ? 200 : 400,
    })
  } catch (error) {
    logger.error('Erro no processamento de email individual', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: `Erro interno: ${error}`,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
}

// ============================================================================
// HANDLER PARA PROCESSAMENTO EM LOTE
// ============================================================================

export async function handleProcessBatch(
  supabase: any,
  request: Request,
  supabaseUrl: string,
  serviceRoleKey: string,
  googleMapsApiKey?: string,
): Promise<Response> {
  try {
    logger.info('Processando emails em lote')

    const body = await request.json()
    const { userId, emails } = body

    // Validação dos parâmetros obrigatórios
    if (!userId || !emails || !Array.isArray(emails)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Parâmetros obrigatórios ausentes: userId, emails (array)',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    // Validação do limite de emails por lote
    if (emails.length > 50) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Limite máximo de 50 emails por lote',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    // Validação de cada email
    for (const email of emails) {
      if (
        !email.emailId ||
        !email.subject ||
        !email.sender ||
        !email.receivedAt ||
        !email.rawContent
      ) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Cada email deve ter: emailId, subject, sender, receivedAt, rawContent',
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 400,
          },
        )
      }
    }

    // Cria serviço de processamento
    const processingService = new EmailProcessingService(
      supabase,
      supabaseUrl,
      serviceRoleKey,
      googleMapsApiKey ?? '',
      env.app.defaultTenantId,
    )

    // Converte emails para formato de request
    const requests: EmailProcessingRequest[] = emails.map((email) => ({
      userId,
      emailId: email.emailId,
      subject: email.subject,
      sender: email.sender,
      receivedAt: email.receivedAt,
      rawContent: email.rawContent,
    }))

    // Processa os emails
    const results = await processingService.processMultipleEmails(requests)

    // Calcula estatísticas do lote
    const successCount = results.filter((r) => r.success).length
    const failureCount = results.length - successCount
    const totalOperations = results.reduce((sum, r) => sum + (r.operationIds?.length || 0), 0)
    const totalIssues = results.reduce((sum, r) => sum + (r.issueIds?.length || 0), 0)

    // Retorna resultado
    return new Response(
      JSON.stringify({
        success: true,
        batchStats: {
          totalEmails: emails.length,
          successCount,
          failureCount,
          totalOperations,
          totalIssues,
        },
        results,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    logger.error('Erro no processamento em lote', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: `Erro interno: ${error}`,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
}

// ============================================================================
// HANDLER PARA PROCESSAMENTO DE EMAILS NÃO PROCESSADOS
// ============================================================================

export async function handleProcessUnprocessed(
  supabase: any,
  request: Request,
  supabaseUrl: string,
  serviceRoleKey: string,
  googleMapsApiKey?: string,
): Promise<Response> {
  try {
    logger.info('Processando emails não processados')

    const body = await request.json()
    const { userId, limit = 10 } = body

    // Validação dos parâmetros obrigatórios
    if (!userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Parâmetro obrigatório ausente: userId',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    // Validação do limite
    if (limit > 100) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Limite máximo de 100 emails por processamento',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    // Cria serviço de processamento
    const processingService = new EmailProcessingService(
      supabase,
      supabaseUrl,
      serviceRoleKey,
      googleMapsApiKey ?? '',
      env.app.defaultTenantId,
    )

    // Processa emails não processados
    const results = await processingService.processUnprocessedEmails(userId, limit)

    // Calcula estatísticas
    const successCount = results.filter((r) => r.success).length
    const failureCount = results.length - successCount
    const totalOperations = results.reduce((sum, r) => sum + (r.operationIds?.length || 0), 0)
    const totalIssues = results.reduce((sum, r) => sum + (r.issueIds?.length || 0), 0)

    // Retorna resultado
    return new Response(
      JSON.stringify({
        success: true,
        unprocessedStats: {
          totalEmails: results.length,
          successCount,
          failureCount,
          totalOperations,
          totalIssues,
        },
        results,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    logger.error('Erro no processamento de emails não processados', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: `Erro interno: ${error}`,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
}

// ============================================================================
// HANDLER PARA ESTATÍSTICAS DE PROCESSAMENTO
// ============================================================================

export async function handleProcessingStats(
  supabase: any,
  request: Request,
  supabaseUrl: string,
  serviceRoleKey: string,
  googleMapsApiKey?: string,
): Promise<Response> {
  try {
    logger.info('Obtendo estatísticas de processamento')

    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    // Validação dos parâmetros obrigatórios
    if (!userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Parâmetro obrigatório ausente: userId',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    // Cria serviço de processamento
    const processingService = new EmailProcessingService(
      supabase,
      supabaseUrl,
      serviceRoleKey,
      googleMapsApiKey ?? '',
      env.app.defaultTenantId,
    )

    // Obtém estatísticas
    const stats = await processingService.getProcessingStats(userId)

    // Retorna resultado
    return new Response(
      JSON.stringify({
        success: true,
        stats,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    logger.error('Erro ao obter estatísticas de processamento', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: `Erro interno: ${error}`,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
}

// ============================================================================
// HANDLER PARA TESTE DE EXTRAÇÃO
// ============================================================================

export async function handleTestExtraction(supabase: any, request: Request): Promise<Response> {
  try {
    logger.info('Testando extração de dados')

    const body = await request.json()
    const { emailContent, subject } = body

    // Validação dos parâmetros obrigatórios
    if (!emailContent || !subject) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Parâmetros obrigatórios ausentes: emailContent, subject',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    // Cria serviço de extração
    const { EmailExtractionService } = await import('../services/email-extraction.service.ts')
    const extractionService = new EmailExtractionService()

    // Testa extração
    const extractedData = await extractionService.extractEmailData(emailContent, subject)

    // Retorna resultado
    return new Response(
      JSON.stringify({
        success: true,
        extractedData,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    logger.error('Erro no teste de extração', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: `Erro interno: ${error}`,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
}

// ============================================================================
// HANDLER PARA TESTE DE CÁLCULO MOLIDE
// ============================================================================

export async function handleTestMOLIDE(supabase: any, request: Request): Promise<Response> {
  try {
    logger.info('Testando cálculo MOLIDE')

    const body = await request.json()
    const { eventData } = body

    // Validação dos parâmetros obrigatórios
    if (!eventData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Parâmetro obrigatório ausente: eventData',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    // Cria serviço de cálculo MOLIDE
    const { MOLIDECalculator } = await import('../services/molide-calculator.service.ts')
    const molideCalculator = new MOLIDECalculator()

    // Testa cálculo
    const molideResult = await molideCalculator.calculateMOLIDEOperations(eventData)

    // Retorna resultado
    return new Response(
      JSON.stringify({
        success: true,
        molideResult,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    logger.error('Erro no teste de cálculo MOLIDE', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: `Erro interno: ${error}`,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
}
