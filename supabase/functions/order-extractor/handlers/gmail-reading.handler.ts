import { createLogger } from '../utils/logger.ts'
import { GmailReaderService, GmailSearchParams } from '../services/gmail-reader.service.ts'
import { EmailProcessingService } from '../services/email-processing.service.ts'
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { env } from '../config/environment.ts'

const logger = createLogger({ service: 'GmailReadingHandlers' })

export async function handleListEmails(
  _supabase: SupabaseClient,
  request: Request,
): Promise<Response> {
  try {
    logger.info('Listando emails do Gmail')

    const url = new URL(request.url)
    const from = url.searchParams.get('from') || undefined
    const subject = url.searchParams.get('subject') || undefined
    const maxResults = parseInt(url.searchParams.get('maxResults') || '10')
    const after = url.searchParams.get('after') || undefined
    const before = url.searchParams.get('before') || undefined

    const readerService = new GmailReaderService()

    const params: GmailSearchParams = {
      from,
      subject,
      maxResults,
      after,
      before,
    }

    const result = await readerService.listMessages(params)

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    logger.error('Erro ao listar emails', error)
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

export async function handleGetEmail(
  _supabase: SupabaseClient,
  request: Request,
): Promise<Response> {
  try {
    logger.info('Obtendo email específico')

    const url = new URL(request.url)
    const messageId = url.searchParams.get('messageId')

    if (!messageId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'messageId é obrigatório',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    const readerService = new GmailReaderService()
    const message = await readerService.getMessage(messageId)

    if (!message) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Mensagem não encontrada',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 404,
        },
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    logger.error('Erro ao obter email', error)
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

export async function handleSearchOrderEmails(
  _supabase: SupabaseClient,
  request: Request,
): Promise<Response> {
  try {
    logger.info('Buscando emails de ordem de serviço')

    const url = new URL(request.url)
    const maxResults = parseInt(url.searchParams.get('maxResults') || '10')
    const onlyUnread = url.searchParams.get('onlyUnread') !== 'false'

    const readerService = new GmailReaderService()
    const messages = await readerService.searchOrderEmails(maxResults, onlyUnread)

    return new Response(
      JSON.stringify({
        success: true,
        messages,
        count: messages.length,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    logger.error('Erro ao buscar emails de ordem', error)
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

export async function handleFetchAndProcess(
  supabase: SupabaseClient,
  request: Request,
  supabaseUrl: string,
  serviceRoleKey: string,
  googleMapsApiKey?: string,
): Promise<Response> {
  try {
    logger.info('Buscando e processando emails automaticamente')

    const body = await request.json()
    const {
      userId,
      maxEmails = 10,
      markAsRead = false,
      onlyUnread = false,
      archivedOnly = false,
      after = undefined,
      before = undefined,
    } = body

    if (!userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'userId é obrigatório',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    const readerService = new GmailReaderService()
    const processingService = new EmailProcessingService(
      supabase,
      supabaseUrl,
      serviceRoleKey,
      googleMapsApiKey ?? '',
      env.app.defaultTenantId,
    )

    // Se archivedOnly = true, buscar apenas emails fora da INBOX
    const customQuery = archivedOnly ? '-in:inbox' : undefined

    const messages = await readerService.searchOrderEmails(
      maxEmails,
      onlyUnread,
      customQuery,
      after,
      before,
    )

    if (messages.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Nenhum email de ordem encontrado',
          processed: 0,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    const results = []
    for (const message of messages) {
      logger.info(`Processando email ${message.id}`, { subject: message.subject })

      const processingResult = await processingService.processEmail({
        userId,
        emailId: message.id,
        subject: message.subject,
        sender: message.from,
        receivedAt: message.date,
        rawContent: message.body,
      })

      results.push({
        messageId: message.id,
        subject: message.subject,
        ...processingResult,
      })

      if (markAsRead && processingResult.success) {
        await readerService.markAsRead(message.id)
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.length - successCount

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        successCount,
        failureCount,
        results,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    logger.error('Erro ao buscar e processar emails', error)
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
