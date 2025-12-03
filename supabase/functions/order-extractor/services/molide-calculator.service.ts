/**
 * SERVIÇO DE CÁLCULO DE OPERAÇÕES MOLIDE
 *
 * Implementa as regras MOLIDE consolidadas versão 2.1
 * Suporta todos os tipos de eventos: contínuos, intermitentes e noturnos
 */

import { createLogger } from '../utils/logger.ts'
import {
  MolideOperationType,
  MolideStatus,
  type MolideOperationTypeValue,
  type MolideStatusValue,
} from '../types/enums.ts'

const logger = createLogger({ service: 'MOLIDECalculator' })

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

export interface EventData {
  id: string
  year: number
  description: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: string
  contract: string
  items: Array<{
    quantity: number
    description: string
    days: number
    price: string
    totalValue: number
  }>
  producers: Array<{
    name: string
    phones: string[]
  }>
  coordinators?: Array<{
    name: string
    phones: string[]
  }>
  dailies?: string[] // Array de datas específicas de uso no formato DD/MM/YYYY
  isCancelled: boolean
}

export interface MOLIDEOperation {
  id: string
  eventId: string
  type: MolideOperationTypeValue
  subtype?: 'pre_use' | 'post_use' | 'daily'
  date: string
  time: string
  duration: number
  vehicleType: 'CARGA' | 'TANQUE'
  driver?: string
  vehicle?: string
  helper?: string
  status: MolideStatusValue
  notes?: string
}

export interface MOLIDECalculationResult {
  eventType: 'CONTINUO' | 'INTERMITENTE' | 'NOTURNO' | 'INTERMITENTE_NOTURNO'
  operations: MOLIDEOperation[]
  mobilizationDateTime?: Date
  demobilizationDateTime?: Date
  preCleaningDateTime?: Date
  postCleaningDateTime?: Date
  metadata: {
    totalOperations: number
    mobilizationCount: number
    cleaningCount: number
    demobilizationCount: number
    isNightEvent: boolean
    isIntermittent: boolean
    calculationVersion: string
  }
}

// ============================================================================
// CLASSE DE CÁLCULO MOLIDE
// ============================================================================

export class MOLIDECalculator {
  private readonly version = '2.1'

  /**
   * Calcula operações MOLIDE para um evento
   */
  async calculateMOLIDEOperations(eventData: EventData): Promise<MOLIDECalculationResult> {
    try {
      logger.info('Iniciando cálculo MOLIDE', {
        eventId: eventData.id,
        description: eventData.description,
      })

      // 1. Identificar tipo de evento
      const eventType = this.identifyEventType(eventData)

      // 2. Calcular operações baseado no tipo
      const operations = await this.calculateOperationsByType(eventData, eventType)

      // 3. Gerar metadados
      const metadata = this.generateMetadata(eventData, eventType, operations)

      // 4. Calcular datetimes MOLIDE
      const molideTimings = this.calculateMOLIDEDatetimes(eventData, operations)

      const result: MOLIDECalculationResult = {
        eventType,
        operations,
        mobilizationDateTime: molideTimings.mobilizationDateTime,
        demobilizationDateTime: molideTimings.demobilizationDateTime,
        preCleaningDateTime: molideTimings.preCleaningDateTime,
        postCleaningDateTime: molideTimings.postCleaningDateTime,
        metadata,
      }

      logger.info('Cálculo MOLIDE concluído', {
        eventType,
        totalOperations: operations.length,
        mobilizationCount: metadata.mobilizationCount,
        cleaningCount: metadata.cleaningCount,
        demobilizationCount: metadata.demobilizationCount,
      })

      return result
    } catch (error) {
      logger.error('Erro no cálculo MOLIDE', error)
      throw new Error(`Falha no cálculo MOLIDE: ${error}`)
    }
  }

  /**
   * Identifica o tipo de evento baseado nas características
   */
  private identifyEventType(eventData: EventData): MOLIDECalculationResult['eventType'] {
    const isNightEvent = this.detectNightEvent(eventData.startTime, eventData.endTime)
    const isIntermittent = this.detectIntermittentEvent(eventData)

    if (isNightEvent && isIntermittent) {
      return 'INTERMITENTE_NOTURNO'
    } else if (isNightEvent && !isIntermittent) {
      return 'NOTURNO'
    } else if (!isNightEvent && isIntermittent) {
      return 'INTERMITENTE'
    } else {
      return 'CONTINUO'
    }
  }

  /**
   * Detecta se o evento é noturno (atravessa meia-noite com atividade significativa à noite)
   */
  private detectNightEvent(startTime: string, endTime: string): boolean {
    const start = this.parseTime(startTime)
    const end = this.parseTime(endTime)

    // Horários noturnos: 22:00 (22h) até 06:00 (6h)
    const nightStart = 22 // 22:00h
    const nightEnd = 6 // 06:00h

    // Se o evento termina exatamente à meia-noite (00:00h) mas começa durante o dia,
    // é um evento diurno que simplesmente termina à meia-noite, NÃO é noturno
    if (end === 0 && start >= nightEnd && start < nightStart) {
      return false
    }

    // Se o horário de fim é menor que o de início, atravessa meia-noite
    if (end < start) {
      // Verifica se o início está no período noturno (após 22h)
      // OU se o fim está no período noturno (antes das 6h, exceto 00:00 que já tratamos acima)
      return start >= nightStart || (end > 0 && end <= nightEnd)
    }

    return false
  }

  /**
   * Detecta se o evento é intermitente
   * Baseado na lista de diárias ou análise do período
   *
   * INTERMITENTE = tem múltiplos dias de uso COM GAPS (pausas) entre eles
   * CONTINUO = tem dias consecutivos SEM GAPS
   */
  private detectIntermittentEvent(eventData: EventData): boolean {
    // Se temos a lista de diárias, ela é a fonte da verdade
    if (eventData.dailies && eventData.dailies.length > 0) {
      const startDate = this.parseBrazilianDate(eventData.startDate)
      const endDate = this.parseBrazilianDate(eventData.endDate)
      const totalDays =
        Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

      // Se o número de diárias é menor que o período total, é intermitente
      if (eventData.dailies.length < totalDays) {
        return true
      }

      // Verifica se as datas são consecutivas
      const sortedDailies = [...eventData.dailies].sort()
      for (let i = 1; i < sortedDailies.length; i++) {
        const prevDate = this.parseBrazilianDate(sortedDailies[i - 1])
        const currDate = this.parseBrazilianDate(sortedDailies[i])
        const diffDays = Math.ceil((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

        // Se há gap entre as datas (diferença > 1 dia), é intermitente
        if (diffDays > 1) {
          return true
        }
      }

      // Se tem diárias e elas são consecutivas sem gaps, é contínuo
      return false
    }

    // Fallback: se não tem diárias, não pode determinar corretamente
    // Neste caso, assume contínuo (evita falsos positivos)
    return false
  }

  /**
   * Calcula operações baseado no tipo de evento
   */
  private async calculateOperationsByType(
    eventData: EventData,
    eventType: MOLIDECalculationResult['eventType'],
  ): Promise<MOLIDEOperation[]> {
    switch (eventType) {
      case 'CONTINUO':
        return this.calculateContinuousOperations(eventData)
      case 'INTERMITENTE':
        return this.calculateIntermittentOperations(eventData)
      case 'NOTURNO':
        return this.calculateNightOperations(eventData)
      case 'INTERMITENTE_NOTURNO':
        return this.calculateIntermittentNightOperations(eventData)
      default:
        throw new Error(`Tipo de evento não reconhecido: ${eventType}`)
    }
  }

  /**
   * Calcula operações para eventos contínuos (Versão Original)
   */
  private calculateContinuousOperations(eventData: EventData): MOLIDEOperation[] {
    const operations: MOLIDEOperation[] = []
    const startDate = this.parseBrazilianDate(eventData.startDate)
    const endDate = this.parseBrazilianDate(eventData.endDate)
    const totalDays =
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    // Mobilização no primeiro dia
    const mobilizationResult = this.subtractHours(eventData.startTime, 4)
    const mobilizationDate = this.addDaysToDate(
      this.formatDate(startDate),
      mobilizationResult.dayOffset,
    )

    operations.push({
      id: `mob-${eventData.id}-001`,
      eventId: eventData.id,
      type: MolideOperationType.MOBILIZATION,
      date: mobilizationDate,
      time: mobilizationResult.time,
      duration: 60,
      vehicleType: 'CARGA',
      status: MolideStatus.SCHEDULED,
      notes: 'Instalação inicial dos equipamentos',
    })

    // Limpezas diárias
    if (totalDays === 1) {
      // Para eventos de 1 dia: limpeza no mesmo dia após o evento (última = SUCTION)
      const cleaningResult = this.addHours(eventData.endTime, 1)
      const cleaningDate = this.addDaysToDate(this.formatDate(startDate), cleaningResult.dayOffset)

      operations.push({
        id: `clean-${eventData.id}-001`,
        eventId: eventData.id,
        type: MolideOperationType.SUCTION,
        subtype: 'post_use',
        date: cleaningDate,
        time: cleaningResult.time,
        duration: 60,
        vehicleType: 'TANQUE',
        status: MolideStatus.SCHEDULED,
        notes: 'Sucção final',
      })
    } else {
      // Para eventos de múltiplos dias: limpezas diárias (todos os dias do evento)
      for (let day = 0; day < totalDays; day++) {
        const cleaningDate = new Date(startDate)
        cleaningDate.setDate(startDate.getDate() + day)

        const cleaningResult = this.addHours(eventData.endTime, 1)
        const finalCleaningDate = this.addDaysToDate(
          this.formatDate(cleaningDate),
          cleaningResult.dayOffset,
        )

        const isLastCleaning = day === totalDays - 1

        operations.push({
          id: `clean-${eventData.id}-${String(day + 1).padStart(3, '0')}`,
          eventId: eventData.id,
          type: isLastCleaning ? MolideOperationType.SUCTION : MolideOperationType.CLEANING,
          subtype: 'daily',
          date: finalCleaningDate,
          time: cleaningResult.time,
          duration: 60,
          vehicleType: 'TANQUE',
          status: MolideStatus.SCHEDULED,
          notes: isLastCleaning ? 'Sucção final' : `Limpeza diária - dia ${day + 1}`,
        })
      }
    }

    // Desmobilização no último dia (sempre 4h após o término - Regra MOLIDE 2.1)
    const demobilizationResult = this.addHours(eventData.endTime, 4)
    const demobilizationDate = this.addDaysToDate(
      this.formatDate(endDate),
      demobilizationResult.dayOffset,
    )

    operations.push({
      id: `demob-${eventData.id}-001`,
      eventId: eventData.id,
      type: MolideOperationType.DEMOBILIZATION,
      date: demobilizationDate,
      time: demobilizationResult.time,
      duration: 60,
      vehicleType: 'CARGA',
      status: MolideStatus.SCHEDULED,
      notes: 'Retirada final dos equipamentos',
    })

    return operations
  }

  /**
   * Calcula operações para eventos intermitentes (Versão 3.0 - Usa diárias reais)
   */
  private calculateIntermittentOperations(eventData: EventData): MOLIDEOperation[] {
    const operations: MOLIDEOperation[] = []

    // Usa lista de diárias se disponível, caso contrário usa fallback antigo
    // IMPORTANTE: As diárias já vêm ordenadas cronologicamente do extrator - não reordenar!
    const usageDates = eventData.dailies && eventData.dailies.length > 0
      ? [...eventData.dailies]
      : eventData.items.map((_, index) => this.addDaysToDate(eventData.startDate, index))

    // Mobilização no primeiro dia do período
    const mobilizationResult = this.subtractHours(eventData.startTime, 4)
    const mobilizationDate = this.addDaysToDate(eventData.startDate, mobilizationResult.dayOffset)

    operations.push({
      id: `mob-${eventData.id}-001`,
      eventId: eventData.id,
      type: MolideOperationType.MOBILIZATION,
      date: mobilizationDate,
      time: mobilizationResult.time,
      duration: 60,
      vehicleType: 'CARGA',
      status: MolideStatus.SCHEDULED,
      notes: 'Instalação inicial dos equipamentos',
    })

    // Limpezas para cada dia de uso
    usageDates.forEach((usageDate, index) => {
      if (index > 0) {
        const currentDate = this.parseBrazilianDate(usageDate)
        const previousDate = this.parseBrazilianDate(usageDates[index - 1])
        const daysDiff = Math.ceil((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysDiff > 1) {
          const preCleanResult = this.subtractHours(eventData.startTime, 3)
          const preCleanDate = this.addDaysToDate(usageDate, preCleanResult.dayOffset)

          operations.push({
            id: `clean-pre-${eventData.id}-${String(index + 1).padStart(3, '0')}`,
            eventId: eventData.id,
            type: MolideOperationType.CLEANING,
            subtype: 'pre_use',
            date: preCleanDate,
            time: preCleanResult.time,
            duration: 60,
            vehicleType: 'TANQUE',
            status: MolideStatus.SCHEDULED,
            notes: `Limpeza pré-uso - dia ${index + 1} de ${usageDates.length}`,
          })
        }
      }

      // Limpeza pós-uso (última = SUCTION)
      const postCleanResult = this.addHours(eventData.endTime, 1)
      const postCleanDate = this.addDaysToDate(usageDate, postCleanResult.dayOffset)

      const isFinalClean = index === usageDates.length - 1

      operations.push({
        id: `clean-post-${eventData.id}-${String(index + 1).padStart(3, '0')}`,
        eventId: eventData.id,
        type: isFinalClean ? MolideOperationType.SUCTION : MolideOperationType.CLEANING,
        subtype: 'post_use',
        date: postCleanDate,
        time: postCleanResult.time,
        duration: 60,
        vehicleType: 'TANQUE',
        status: MolideStatus.SCHEDULED,
        notes: isFinalClean
          ? `Sucção final - preparação para desmobilização`
          : `Limpeza pós-uso - dia ${index + 1} de ${usageDates.length}`,
      })
    })

    // Desmobilização no último dia de uso (4h após o término)
    const lastUsageDate = usageDates[usageDates.length - 1]
    const demobilizationResult = this.addHours(eventData.endTime, 4)
    const demobilizationDate = this.addDaysToDate(
      lastUsageDate,
      demobilizationResult.dayOffset,
    )

    operations.push({
      id: `demob-${eventData.id}-001`,
      eventId: eventData.id,
      type: MolideOperationType.DEMOBILIZATION,
      date: demobilizationDate,
      time: demobilizationResult.time,
      duration: 60,
      vehicleType: 'CARGA',
      status: MolideStatus.SCHEDULED,
      notes: 'Retirada final dos equipamentos',
    })

    return operations
  }

  /**
   * Calcula operações para eventos noturnos (Versão 2.1)
   */
  private calculateNightOperations(eventData: EventData): MOLIDEOperation[] {
    const operations: MOLIDEOperation[] = []
    const startDate = this.parseBrazilianDate(eventData.startDate)
    const endDate = this.parseBrazilianDate(eventData.endDate)
    const totalDays =
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    // Mobilização no primeiro dia
    const mobilizationResult = this.subtractHours(eventData.startTime, 4)
    const mobilizationDate = this.addDaysToDate(
      this.formatDate(startDate),
      mobilizationResult.dayOffset,
    )

    operations.push({
      id: `mob-${eventData.id}-001`,
      eventId: eventData.id,
      type: MolideOperationType.MOBILIZATION,
      date: mobilizationDate,
      time: mobilizationResult.time,
      duration: 60,
      vehicleType: 'CARGA',
      status: MolideStatus.SCHEDULED,
      notes: 'Instalação inicial dos equipamentos',
    })

    // Limpezas diárias (ajustadas para eventos noturnos)
    // Para eventos noturnos, limpeza pode ser no dia seguinte ao término real
    const realEndTime = this.calculateRealEndTime(eventData.startTime, eventData.endTime)
    const cleaningResult = this.addHours(realEndTime, 1)

    if (totalDays === 1) {
      // Para eventos de 1 dia: limpeza no dia seguinte (evento atravessa meia-noite) - última = SUCTION
      const cleaningDate = new Date(endDate)
      cleaningDate.setDate(endDate.getDate() + 1)
      const finalCleaningDate = this.addDaysToDate(
        this.formatDate(cleaningDate),
        cleaningResult.dayOffset,
      )

      operations.push({
        id: `clean-${eventData.id}-001`,
        eventId: eventData.id,
        type: MolideOperationType.SUCTION,
        subtype: 'post_use',
        date: finalCleaningDate,
        time: cleaningResult.time,
        duration: 60,
        vehicleType: 'TANQUE',
        status: MolideStatus.SCHEDULED,
        notes: 'Sucção final (evento noturno)',
      })
    } else {
      // Para eventos de múltiplos dias: limpezas diárias (todos os dias do evento) - última = SUCTION
      for (let day = 0; day < totalDays; day++) {
        const cleaningDate = new Date(startDate)
        cleaningDate.setDate(startDate.getDate() + day)
        const finalCleaningDate = this.addDaysToDate(
          this.formatDate(cleaningDate),
          cleaningResult.dayOffset,
        )

        const isLastCleaning = day === totalDays - 1

        operations.push({
          id: `clean-${eventData.id}-${String(day + 1).padStart(3, '0')}`,
          eventId: eventData.id,
          type: isLastCleaning ? MolideOperationType.SUCTION : MolideOperationType.CLEANING,
          subtype: 'daily',
          date: finalCleaningDate,
          time: cleaningResult.time,
          duration: 60,
          vehicleType: 'TANQUE',
          status: MolideStatus.SCHEDULED,
          notes: isLastCleaning
            ? 'Sucção final (evento noturno)'
            : `Limpeza diária - dia ${day + 1} (evento noturno)`,
        })
      }
    }

    // Desmobilização (ajustada para eventos noturnos)
    const demobilizationResult = this.addHours(realEndTime, 4)
    const demobilizationDate = this.addDaysToDate(
      this.formatDate(endDate),
      demobilizationResult.dayOffset,
    )

    operations.push({
      id: `demob-${eventData.id}-001`,
      eventId: eventData.id,
      type: MolideOperationType.DEMOBILIZATION,
      date: demobilizationDate,
      time: demobilizationResult.time,
      duration: 60,
      vehicleType: 'CARGA',
      status: MolideStatus.SCHEDULED,
      notes: 'Retirada final dos equipamentos (evento noturno)',
    })

    return operations
  }

  /**
   * Calcula operações para eventos intermitentes noturnos (Versão 2.1)
   */
  private calculateIntermittentNightOperations(eventData: EventData): MOLIDEOperation[] {
    // Combina lógica de intermitente com ajustes noturnos
    const operations = this.calculateIntermittentOperations(eventData)

    // Ajusta horários para eventos noturnos
    return operations.map((op) => {
      // Ajusta limpezas pós-uso (CLEANING ou SUCTION)
      if ((op.type === MolideOperationType.CLEANING || op.type === MolideOperationType.SUCTION) && op.subtype === 'post_use') {
        const realEndTime = this.calculateRealEndTime(eventData.startTime, eventData.endTime)
        const cleanResult = this.addHours(realEndTime, 1)
        const adjustedDate = this.addDaysToDate(op.date, cleanResult.dayOffset)
        return {
          ...op,
          date: adjustedDate,
          time: cleanResult.time,
          notes: `${op.notes} (evento noturno)`,
        }
      }

      if (op.type === MolideOperationType.DEMOBILIZATION) {
        const realEndTime = this.calculateRealEndTime(eventData.startTime, eventData.endTime)
        const demobResult = this.addHours(realEndTime, 4)
        const adjustedDate = this.addDaysToDate(op.date, demobResult.dayOffset)
        return {
          ...op,
          date: adjustedDate,
          time: demobResult.time,
          notes: `${op.notes} (evento noturno)`,
        }
      }

      return op
    })
  }

  /**
   * Calcula horário real de término para eventos noturnos
   */
  private calculateRealEndTime(startTime: string, endTime: string): string {
    const start = this.parseTime(startTime)
    const end = this.parseTime(endTime)

    if (end < start) {
      // Evento noturno - adiciona 24 horas ao horário de fim
      const result = this.addHours(endTime, 24)
      return result.time
    }

    return endTime
  }

  /**
   * Gera metadados do cálculo
   */
  private generateMetadata(
    eventData: EventData,
    eventType: MOLIDECalculationResult['eventType'],
    operations: MOLIDEOperation[],
  ): MOLIDECalculationResult['metadata'] {
    const mobilizationCount = operations.filter(
      (op) => op.type === MolideOperationType.MOBILIZATION,
    ).length
    const cleaningCount = operations.filter(
      (op) => op.type === MolideOperationType.CLEANING || op.type === MolideOperationType.SUCTION
    ).length
    const demobilizationCount = operations.filter(
      (op) => op.type === MolideOperationType.DEMOBILIZATION,
    ).length

    return {
      totalOperations: operations.length,
      mobilizationCount,
      cleaningCount,
      demobilizationCount,
      isNightEvent: eventType.includes('NOTURNO'),
      isIntermittent: eventType.includes('INTERMITENTE'),
      calculationVersion: this.version,
    }
  }

  // ============================================================================
  // FUNÇÕES AUXILIARES
  // ============================================================================

  private parseTime(timeStr: string): number {
    const cleanTime = timeStr.replace(/h$/i, '').trim()
    const [hours, minutes] = cleanTime.split(':').map(Number)
    return hours + minutes / 60
  }

  private formatTime(hours: number): string {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  private addHours(timeStr: string, hours: number): { time: string; dayOffset: number } {
    const time = this.parseTime(timeStr)
    const newTime = time + hours

    // Calcula quantos dias foram adicionados
    const dayOffset = Math.floor(newTime / 24)

    // Normaliza para 24h
    const normalizedTime = ((newTime % 24) + 24) % 24
    return {
      time: this.formatTime(normalizedTime),
      dayOffset,
    }
  }

  private subtractHours(timeStr: string, hours: number): { time: string; dayOffset: number } {
    const time = this.parseTime(timeStr)
    const newTime = time - hours

    // Calcula quantos dias foram subtraídos
    const dayOffset = newTime < 0 ? Math.floor(newTime / 24) : 0

    // Normaliza para 24h
    const normalizedTime = ((newTime % 24) + 24) % 24
    return {
      time: this.formatTime(normalizedTime),
      dayOffset,
    }
  }

  private parseBrazilianDate(dateStr: string): Date {
    const parts = dateStr.split('/')
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const year = parseInt(parts[2], 10)
      return new Date(year, month, day)
    }
    return new Date(dateStr)
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  private addDaysToDate(dateStr: string, days: number): string {
    const date = this.parseBrazilianDate(dateStr)
    date.setDate(date.getDate() + days)
    return this.formatDate(date)
  }

  /**
   * Calcula os datetimes MOLIDE baseado nas operações geradas
   */
  private calculateMOLIDEDatetimes(
    eventData: EventData,
    operations: MOLIDEOperation[],
  ): {
    mobilizationDateTime?: Date
    demobilizationDateTime?: Date
    preCleaningDateTime?: Date
    postCleaningDateTime?: Date
  } {
    const result: {
      mobilizationDateTime?: Date
      demobilizationDateTime?: Date
      preCleaningDateTime?: Date
      postCleaningDateTime?: Date
    } = {}

    // Buscar primeira mobilização
    const mobilization = operations.find((op) => op.type === MolideOperationType.MOBILIZATION)
    if (mobilization) {
      result.mobilizationDateTime = this.combineDateAndTime(mobilization.date, mobilization.time)
    }

    // Buscar última desmobilização
    const demobilizations = operations.filter(
      (op) => op.type === MolideOperationType.DEMOBILIZATION,
    )
    if (demobilizations.length > 0) {
      const lastDemob = demobilizations[demobilizations.length - 1]
      result.demobilizationDateTime = this.combineDateAndTime(lastDemob.date, lastDemob.time)
    }

    // Buscar limpezas pré-uso e pós-uso
    const cleanings = operations.filter((op) => op.type === MolideOperationType.CLEANING)
    const preUseCleaning = cleanings.find((op) => op.subtype === 'pre_use')
    const postUseCleaning = cleanings.find((op) => op.subtype === 'post_use')

    if (preUseCleaning) {
      result.preCleaningDateTime = this.combineDateAndTime(preUseCleaning.date, preUseCleaning.time)
    }

    if (postUseCleaning) {
      result.postCleaningDateTime = this.combineDateAndTime(
        postUseCleaning.date,
        postUseCleaning.time,
      )
    }

    return result
  }

  /**
   * Combina data e hora em um objeto Date
   */
  private combineDateAndTime(dateStr: string, timeStr: string): Date {
    // dateStr vem no formato YYYY-MM-DD
    // timeStr vem no formato HH:MM
    const [year, month, day] = dateStr.split('-').map(Number)
    const [hours, minutes] = timeStr.split(':').map(Number)

    return new Date(year, month - 1, day, hours, minutes, 0, 0)
  }
}
