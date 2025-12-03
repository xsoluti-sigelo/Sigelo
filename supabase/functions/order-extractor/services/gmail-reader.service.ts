import { createLogger } from '../utils/logger.ts'
import { GmailAuthService } from './gmail-auth.service.ts'

const logger = createLogger({ service: 'GmailReaderService' })

export interface GmailMessage {
  id: string
  threadId: string
  labelIds: string[]
  snippet: string
  internalDate: string
  subject: string
  from: string
  to: string
  date: string
  body: string
  bodyHtml?: string
}

export interface GmailSearchParams {
  query?: string
  from?: string
  subject?: string
  after?: string
  before?: string
  maxResults?: number
  labelIds?: string[]
}

export interface GmailListResponse {
  messages: GmailMessage[]
  nextPageToken?: string
  resultSizeEstimate: number
}

export class GmailReaderService {
  private authService: GmailAuthService
  private baseUrl = 'https://gmail.googleapis.com/gmail/v1/users/me'

  constructor() {
    this.authService = new GmailAuthService()
  }

  async listMessages(params: GmailSearchParams = {}): Promise<GmailListResponse> {
    try {
      logger.info('Listando mensagens do Gmail', { params })

      const accessToken = await this.authService.getAccessToken()
      const query = this.buildQuery(params)
      const maxResults = params.maxResults || 10

      const url = `${this.baseUrl}/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Falha ao listar mensagens: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      if (!data.messages || data.messages.length === 0) {
        logger.info('Nenhuma mensagem encontrada', { query })
        return {
          messages: [],
          resultSizeEstimate: 0,
        }
      }

      const messages: GmailMessage[] = []
      for (const msg of data.messages) {
        const fullMessage = await this.getMessage(msg.id, accessToken)
        if (fullMessage) {
          messages.push(fullMessage)
        }
      }

      logger.info(`${messages.length} mensagens recuperadas com sucesso`)

      return {
        messages,
        nextPageToken: data.nextPageToken,
        resultSizeEstimate: data.resultSizeEstimate || messages.length,
      }
    } catch (error) {
      logger.error('Erro ao listar mensagens do Gmail', error)
      throw error
    }
  }

  async getMessage(messageId: string, accessToken?: string): Promise<GmailMessage | null> {
    try {
      const token = accessToken || (await this.authService.getAccessToken())
      const url = `${this.baseUrl}/messages/${messageId}?format=full`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error(`Falha ao obter mensagem ${messageId}`, {
          status: response.status,
          error: errorText,
        })
        return null
      }

      const data = await response.json()
      return this.parseMessage(data)
    } catch (error) {
      logger.error(`Erro ao obter mensagem ${messageId}`, error)
      return null
    }
  }

  private parseMessage(data: any): GmailMessage {
    const headers = data.payload?.headers || []
    const getHeader = (name: string) => {
      const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())
      return header?.value || ''
    }

    const subject = getHeader('Subject')
    const from = getHeader('From')
    const to = getHeader('To')
    const date = getHeader('Date')

    const body = this.extractBody(data.payload)
    const bodyHtml = this.extractBodyHtml(data.payload)

    return {
      id: data.id,
      threadId: data.threadId,
      labelIds: data.labelIds || [],
      snippet: data.snippet || '',
      internalDate: data.internalDate,
      subject,
      from,
      to,
      date,
      body,
      bodyHtml,
    }
  }

  private extractBody(payload: any): string {
    if (payload.body?.data) {
      return this.decodeBase64(payload.body.data)
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return this.decodeBase64(part.body.data)
        }
      }

      for (const part of payload.parts) {
        if (part.parts) {
          const nestedBody = this.extractBody(part)
          if (nestedBody) return nestedBody
        }
      }

      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          return this.stripHtml(this.decodeBase64(part.body.data))
        }
      }
    }

    return ''
  }

  private extractBodyHtml(payload: any): string | undefined {
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          return this.decodeBase64(part.body.data)
        }
      }

      for (const part of payload.parts) {
        if (part.parts) {
          const nestedHtml = this.extractBodyHtml(part)
          if (nestedHtml) return nestedHtml
        }
      }
    }

    return undefined
  }

  private decodeBase64(data: string): string {
    try {
      const cleanData = data.replace(/-/g, '+').replace(/_/g, '/')
      const binaryString = atob(cleanData)
      const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0))
      return new TextDecoder('utf-8').decode(bytes)
    } catch (error) {
      logger.error('Erro ao decodificar base64', error)
      return ''
    }
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
  }

  private buildQuery(params: GmailSearchParams): string {
    const parts: string[] = []

    if (params.query) {
      parts.push(params.query)
    }

    if (params.from) {
      parts.push(`from:${params.from}`)
    }

    if (params.subject) {
      parts.push(`subject:${params.subject}`)
    }

    if (params.after) {
      parts.push(`after:${params.after}`)
    }

    if (params.before) {
      parts.push(`before:${params.before}`)
    }

    if (params.labelIds && params.labelIds.length > 0) {
      params.labelIds.forEach((label) => {
        parts.push(`label:${label}`)
      })
    }

    return parts.length > 0 ? parts.join(' ') : 'in:inbox'
  }

  async searchOrderEmails(
    maxResults: number = 10,
    onlyUnread: boolean = false,
    customQuery?: string,
    after?: string,
    before?: string,
  ): Promise<GmailMessage[]> {
    try {
      logger.info('Buscando emails de ordem de serviço de ORDEMFORNECIMENTO@spturis.com')

      const params: GmailSearchParams = {
        from: 'ORDEMFORNECIMENTO@spturis.com',
        maxResults,
      }

      if (onlyUnread) {
        params.labelIds = ['UNREAD']
      }

      if (after) {
        params.after = after
      }

      if (before) {
        params.before = before
      }

      // Se houver query customizada, adicionar
      if (customQuery) {
        params.query = customQuery
      }

      const result = await this.listMessages(params)

      logger.info(`${result.messages.length} emails de ordem encontrados`)
      return result.messages
    } catch (error) {
      logger.error('Erro ao buscar emails de ordem', error)
      throw error
    }
  }

  async markAsRead(messageId: string): Promise<boolean> {
    try {
      const accessToken = await this.authService.getAccessToken()
      const url = `${this.baseUrl}/messages/${messageId}/modify`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          removeLabelIds: ['UNREAD'],
        }),
      })

      if (!response.ok) {
        logger.error(`Falha ao marcar mensagem ${messageId} como lida`)
        return false
      }

      logger.info(`Mensagem ${messageId} marcada como lida`)
      return true
    } catch (error) {
      logger.error(`Erro ao marcar mensagem ${messageId} como lida`, error)
      return false
    }
  }

  async addLabel(messageId: string, labelId: string): Promise<boolean> {
    try {
      const accessToken = await this.authService.getAccessToken()
      const url = `${this.baseUrl}/messages/${messageId}/modify`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addLabelIds: [labelId],
        }),
      })

      if (!response.ok) {
        logger.error(`Falha ao adicionar label à mensagem ${messageId}`)
        return false
      }

      logger.info(`Label ${labelId} adicionada à mensagem ${messageId}`)
      return true
    } catch (error) {
      logger.error(`Erro ao adicionar label à mensagem ${messageId}`, error)
      return false
    }
  }
}
