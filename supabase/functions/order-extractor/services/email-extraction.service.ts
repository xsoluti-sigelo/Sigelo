/**
 * SERVIÇO DE EXTRAÇÃO DE DADOS DE EMAILS
 *
 * Implementa a extração de dados estruturados de emails usando regex patterns validados
 * Baseado nos patterns que alcançaram 100% de precisão nos testes
 */

import { createLogger } from '../utils/logger.ts'

const logger = createLogger({ service: 'EmailExtractionService' })

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

export interface ExtractedEmailData {
  // Dados do subject
  subject: {
    type: 'normal' | 'cancelamento' | 'reenvio'
    eventId: string
    estimateId: string
    orderId: string
    description: string
    raw: string
  }

  // Dados do evento
  event: {
    id: string
    year: number
    description: string
    hasYear: boolean
  }

  // Datas e horários
  dates: {
    startDate: string
    endDate: string
    startTime: string
    endTime: string
  }

  // Dados do contrato
  contract: string

  // Localização
  location: string

  // Produtores
  producers: {
    raw: string
    parsed: Array<{
      name: string
      phones: string[]
    }>
  }

  // Coordenadores (opcional)
  coordinators?: {
    raw: string
    parsed: Array<{
      name: string
      phones: string[]
    }>
  }

  // Itens
  items: {
    raw: string
    parsed: Array<{
      quantity: number
      description: string
      days: number
      price: string
      totalValue: number
    }>
    totalItems: number
    totalValue: number
  }

  // Diárias (opcional)
  dailies?: {
    raw: string
    exists: boolean
    parsed: string[] // Array de datas no formato DD/MM/YYYY
  }

  // Status
  isCancelled: boolean

  // Telefones extraídos
  phoneNumbers: Array<{
    areaCode: string
    number: string
    full: string
  }>

  // Resumo
  summary: {
    totalFieldsExtracted: number
    hasEvent: boolean
    hasDates: boolean
    hasContract: boolean
    hasLocation: boolean
    hasProducers: boolean
    hasCoordinators: boolean
    hasItems: boolean
    hasDailies: boolean
    extractionSuccess: boolean
  }
}

// ============================================================================
// REGEX PATTERNS VALIDADOS
// ============================================================================

const EMAIL_PATTERNS = {
  // Subject patterns
  subjectNormal: /EVENTO\s+(\d+),\s+ESTIMATIVA\s+(\d+),\s+O\.F\.\s+(\d+),\s+(.+)/i,
  subjectCancelamento:
    /Cancelamento.*?EVENTO\s+(\d+),\s+ESTIMATIVA\s+(\d+),\s+O\.F\.\s+(\d+),\s+(.+)/i,
  subjectReenvio: /Reenvio.*?EVENTO\s+(\d+),\s+ESTIMATIVA\s+(\d+),\s+O\.F\.\s+(\d+),\s+(.+)/i,

  // Event patterns
  eventWithYear: /-:\s*EVENTO\s*:-\s*(\d+)\s+(\d{4})\s*-?\s*(.+?)(?=\n|de\s)/s,
  eventWithoutYear: /-:\s*EVENTO\s*:-\s*(\d+)\s+(.+?)(?=\n|de\s)/s,

  // Date/time patterns - flexível para diferentes encodings
  // Suporta: "até", "atÃ©" (UTF-8 mal codificado), "at" (truncado)
  dateTimePeriod: [
    /de\s+(\d{2}\/\d{2}\/\d{4})\s+(?:até|atÃ©|at[eé])\s+(\d{2}\/\d{2}\/\d{4}),\s+de\s+([\d:h]+)\s+(?:até|atÃ©|at[eé])\s+([\d:h]+)/i,
    /de\s+(\d{2}\/\d{2}\/\d{4})\s+at\s+(\d{2}\/\d{2}\/\d{4}),\s+de\s+([\d:h]+)\s+at\s+([\d:h]+)/i,
    /de\s+(\d{2}\/\d{2}\/\d{4})\s+.*?\s+(\d{2}\/\d{2}\/\d{4}),\s+de\s+([\d:h]+)\s+.*?\s+([\d:h]+)/i,
  ],

  // Contract pattern
  contractNumber: /-:\s*Nr\.Contrato\s*:-\s*(.+?)(?=\s*-:\s*LOCAL\s*:-)/s,

  // Location pattern
  location: /-:\s*LOCAL\s*:-\s*([\s\S]*?)(?=-:\s*PRODUTOR|-:\s*ITEM|$)/,

  // Producers pattern
  producersSection: /-:\s*PRODUTOR\(es\)\s*:-\s*([\s\S]*?)(?=-:\s*ITEM|Coord\(s\)\.|$)/,

  // Coordinators pattern
  coordinators: /Coord\(s\)\.:(.+?)(?=-:\s*ITEM\s*:-)/s,

  // Items pattern - suporta múltiplos itens
  itemsSection: /-:\s*ITEM\s*:-\s*([\s\S]*?)(?=-:\s*DI[ÁA]RIA|ATENCIOSAMENTE|$)/i,

  // Individual item pattern
  itemPattern:
    /(\d+)\s+(BANHEIRO\s+QU[ÍI]MICO\s+(?:PADRAO|PCD|PADRÃO))\s*-\s*x(\d+)\s*di(?:\u00e1|\u00c1|a)ria\(s\)\s*-\s*R\$\s*([\d.,]+)/gi,

  // Dailies pattern
  dailySection: /-:\s*DI[ÁA]RIA\(s\)\s*:-\s*([\s\S]*?)(?=ATENCIOSAMENTE|$)/i,

  // Cancellation pattern
  cancellation: /\*\*O\.F\.\s*Cancelada/i,

  // Phone numbers
  phoneNumbers: /\((\d{2})\)\s*([\d-]+)/gi,
}

// ============================================================================
// CLASSE DE SERVIÇO DE EXTRAÇÃO
// ============================================================================

export class EmailExtractionService {
  /**
   * Extrai dados estruturados de um email
   */
  async extractEmailData(emailContent: string, subject: string): Promise<ExtractedEmailData> {
    try {
      logger.info('Iniciando extração de dados do email', { subject })

      // Extrai dados do subject
      const subjectData = this.extractSubjectData(subject)

      // Extrai dados do evento
      const eventData = this.extractEventData(emailContent)

      // Extrai datas e horários
      const dates = this.extractDates(emailContent)

      // Extrai outros dados
      const contract = this.extractContract(emailContent)
      const location = this.extractLocation(emailContent)
      const producers = this.extractProducers(emailContent)
      const coordinators = this.extractCoordinators(emailContent)
      const items = this.extractItems(emailContent)
      const dailies = this.extractDailies(emailContent)
      const isCancelled = this.extractCancellationStatus(emailContent)
      const phoneNumbers = this.extractPhoneNumbers(emailContent)

      // Calcula resumo
      const summary = this.calculateSummary({
        subjectData,
        eventData,
        dates,
        contract,
        location,
        producers,
        coordinators,
        items,
        dailies,
        isCancelled,
      })

      const extractedData: ExtractedEmailData = {
        subject: subjectData,
        event: eventData,
        dates,
        contract,
        location,
        producers,
        coordinators,
        items,
        dailies,
        isCancelled,
        phoneNumbers,
        summary,
      }

      logger.info('Extração concluída com sucesso', {
        totalFields: summary.totalFieldsExtracted,
        success: summary.extractionSuccess,
      })

      return extractedData
    } catch (error) {
      logger.error('Erro na extração de dados do email', error)
      throw new Error(`Falha na extração: ${error}`)
    }
  }

  /**
   * Extrai dados do subject usando regex patterns
   */
  private extractSubjectData(subject: string): ExtractedEmailData['subject'] {
    // Tenta pattern normal
    let match = subject.match(EMAIL_PATTERNS.subjectNormal)
    if (match) {
      return {
        type: 'normal',
        eventId: match[1],
        estimateId: match[2],
        orderId: match[3],
        description: match[4],
        raw: subject,
      }
    }

    // Tenta pattern cancelamento
    match = subject.match(EMAIL_PATTERNS.subjectCancelamento)
    if (match) {
      return {
        type: 'cancelamento',
        eventId: match[1],
        estimateId: match[2],
        orderId: match[3],
        description: match[4],
        raw: subject,
      }
    }

    // Tenta pattern reenvio
    match = subject.match(EMAIL_PATTERNS.subjectReenvio)
    if (match) {
      return {
        type: 'reenvio',
        eventId: match[1],
        estimateId: match[2],
        orderId: match[3],
        description: match[4],
        raw: subject,
      }
    }

    // Fallback para subject não reconhecido
    return {
      type: 'normal',
      eventId: '',
      estimateId: '',
      orderId: '',
      description: subject,
      raw: subject,
    }
  }

  /**
   * Extrai dados do evento usando regex patterns
   */
  private extractEventData(content: string): ExtractedEmailData['event'] {
    // Tenta com ano primeiro
    let match = content.match(EMAIL_PATTERNS.eventWithYear)
    if (match) {
      return {
        id: match[1],
        year: parseInt(match[2]),
        description: match[3].trim(),
        hasYear: true,
      }
    }

    // Tenta sem ano
    match = content.match(EMAIL_PATTERNS.eventWithoutYear)
    if (match) {
      return {
        id: match[1],
        year: new Date().getFullYear(), // Ano atual como fallback
        description: match[2].trim(),
        hasYear: false,
      }
    }

    // Fallback
    return {
      id: '',
      year: new Date().getFullYear(),
      description: '',
      hasYear: false,
    }
  }

  /**
   * Extrai datas e horários usando regex patterns
   */
  private extractDates(content: string): ExtractedEmailData['dates'] {
    for (const pattern of EMAIL_PATTERNS.dateTimePeriod) {
      const match = content.match(pattern)
      if (match) {
        return {
          startDate: match[1],
          endDate: match[2],
          startTime: match[3],
          endTime: match[4],
        }
      }
    }

    // Fallback
    return {
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
    }
  }

  /**
   * Extrai número do contrato usando regex pattern
   */
  private extractContract(content: string): string {
    const match = content.match(EMAIL_PATTERNS.contractNumber)
    return match ? match[1].trim() : ''
  }

  /**
   * Extrai localização usando regex pattern
   */
  private extractLocation(content: string): string {
    const match = content.match(EMAIL_PATTERNS.location)
    return match ? match[1].trim() : ''
  }

  /**
   * Extrai produtores usando regex patterns
   */
  private extractProducers(content: string): ExtractedEmailData['producers'] {
    const match = content.match(EMAIL_PATTERNS.producersSection)
    if (!match) {
      return {
        raw: '',
        parsed: [],
      }
    }

    const producersText = match[1].trim()
    const lines = producersText.split('\n').filter((line) => line.trim())

    const parsed = lines.map((line) => {
      const phones = [...line.matchAll(EMAIL_PATTERNS.phoneNumbers)]
      let name = line

      if (phones.length > 0) {
        const firstPhoneIndex = line.indexOf(phones[0][0])
        name = line.substring(0, firstPhoneIndex).trim()
      }

      return {
        name: name,
        phones: phones.map((phone) => `(${phone[1]}) ${phone[2]}`),
      }
    })

    return {
      raw: producersText,
      parsed,
    }
  }

  /**
   * Extrai coordenadores usando regex patterns
   */
  private extractCoordinators(content: string): ExtractedEmailData['coordinators'] | undefined {
    const match = content.match(EMAIL_PATTERNS.coordinators)
    if (!match) return undefined

    const coordText = match[1].trim()
    const lines = coordText.split('\n').filter((line) => line.trim())

    const parsed = lines.map((line) => {
      const phones = [...line.matchAll(EMAIL_PATTERNS.phoneNumbers)]
      let name = line

      if (phones.length > 0) {
        const firstPhoneIndex = line.indexOf(phones[0][0])
        name = line.substring(0, firstPhoneIndex).trim()
      }

      return {
        name: name,
        phones: phones.map((phone) => `(${phone[1]}) ${phone[2]}`),
      }
    })

    return {
      raw: coordText,
      parsed,
    }
  }

  /**
   * Extrai itens usando regex patterns
   */
  private extractItems(content: string): ExtractedEmailData['items'] {
    const match = content.match(EMAIL_PATTERNS.itemsSection)
    if (!match) {
      return {
        raw: '',
        parsed: [],
        totalItems: 0,
        totalValue: 0,
      }
    }

    const itemsText = match[1]
    const itemMatches = [...itemsText.matchAll(EMAIL_PATTERNS.itemPattern)]

    const parsed = itemMatches.map((match) => {
      const quantity = parseInt(match[1])
      const description = match[2]
      const days = parseInt(match[3])
      const price = match[4]
      const priceNormalized = price.replace(/\./g, '').replace(',', '.')
      const totalValue = parseFloat(priceNormalized)

      return {
        quantity,
        description,
        days,
        price,
        totalValue,
      }
    })

    const totalValue = parsed.reduce((sum, item) => sum + item.totalValue, 0)

    return {
      raw: itemsText,
      parsed,
      totalItems: parsed.length,
      totalValue,
    }
  }

  /**
   * Extrai diárias usando regex pattern
   */
  private extractDailies(content: string): ExtractedEmailData['dailies'] | undefined {
    const match = content.match(EMAIL_PATTERNS.dailySection)
    if (!match) return undefined

    const rawText = match[1].trim()
    const parsedDates = this.parseDailyDates(rawText)

    return {
      raw: rawText,
      exists: true,
      parsed: parsedDates,
    }
  }

  /**
   * Parseia as datas da seção DIÁRIA(s)
   * Formato esperado: "01/11/2025 á 02/11/2025  1a. Diária x2"
   */
  private parseDailyDates(rawText: string): string[] {
    const dates: string[] = []
    const lines = rawText.split('\n').filter((line) => line.trim())

    // Regex para capturar as datas em cada linha
    // Formato: DD/MM/YYYY á DD/MM/YYYY  1a. Diária x{count}
    const dateRangePattern = /(\d{2}\/\d{2}\/\d{4})\s+[áa]\s+(\d{2}\/\d{2}\/\d{4})/gi

    for (const line of lines) {
      const matches = [...line.matchAll(dateRangePattern)]

      for (const match of matches) {
        const startDate = match[1]
        const endDate = match[2]

        // Se as datas são iguais, é um único dia
        if (startDate === endDate) {
          if (!dates.includes(startDate)) {
            dates.push(startDate)
          }
        } else {
          // Se são diferentes, adiciona todos os dias do range
          const allDatesInRange = this.getDateRange(startDate, endDate)
          for (const date of allDatesInRange) {
            if (!dates.includes(date)) {
              dates.push(date)
            }
          }
        }
      }
    }

    // Ordenar cronologicamente (não alfabeticamente)
    return dates.sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('/').map(Number)
      const [dayB, monthB, yearB] = b.split('/').map(Number)
      const dateA = new Date(yearA, monthA - 1, dayA)
      const dateB = new Date(yearB, monthB - 1, dayB)
      return dateA.getTime() - dateB.getTime()
    })
  }

  /**
   * Gera todas as datas entre startDate e endDate (inclusivo)
   */
  private getDateRange(startDateStr: string, endDateStr: string): string[] {
    const dates: string[] = []
    const [startDay, startMonth, startYear] = startDateStr.split('/').map(Number)
    const [endDay, endMonth, endYear] = endDateStr.split('/').map(Number)

    const startDate = new Date(startYear, startMonth - 1, startDay)
    const endDate = new Date(endYear, endMonth - 1, endDay)

    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const day = String(currentDate.getDate()).padStart(2, '0')
      const month = String(currentDate.getMonth() + 1).padStart(2, '0')
      const year = currentDate.getFullYear()
      dates.push(`${day}/${month}/${year}`)

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates
  }

  /**
   * Verifica status de cancelamento usando regex pattern
   */
  private extractCancellationStatus(content: string): boolean {
    return EMAIL_PATTERNS.cancellation.test(content)
  }

  /**
   * Extrai números de telefone usando regex pattern
   */
  private extractPhoneNumbers(content: string): ExtractedEmailData['phoneNumbers'] {
    const matches = [...content.matchAll(EMAIL_PATTERNS.phoneNumbers)]

    return matches.map((match) => ({
      areaCode: match[1],
      number: match[2],
      full: `(${match[1]}) ${match[2]}`,
    }))
  }

  /**
   * Calcula resumo da extração
   */
  private calculateSummary(data: any): ExtractedEmailData['summary'] {
    const fields = [
      data.subjectData.eventId,
      data.eventData.id,
      data.dates.startDate,
      data.contract,
      data.location,
      data.producers.parsed.length > 0,
      data.coordinators?.parsed.length > 0,
      data.items.parsed.length > 0,
      data.dailies?.exists,
    ]

    const extractedCount = fields.filter((field) => field).length

    return {
      totalFieldsExtracted: extractedCount,
      hasEvent: !!(data.subjectData.eventId && data.eventData.id),
      hasDates: !!(data.dates.startDate && data.dates.endDate),
      hasContract: !!data.contract,
      hasLocation: !!data.location,
      hasProducers: data.producers.parsed.length > 0,
      hasCoordinators: data.coordinators?.parsed.length > 0,
      hasItems: data.items.parsed.length > 0,
      hasDailies: !!data.dailies?.exists,
      extractionSuccess: extractedCount >= 5, // Mínimo de 5 campos para considerar sucesso
    }
  }
}
