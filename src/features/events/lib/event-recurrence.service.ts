import { OperationType } from '@/features/operations/config/operations-config'
import type { CleaningRule, DayOfWeek } from '../config/events-config'
import { EventType } from '../config/event-types'
import type { EventTypeValue } from '../config/event-types'

export type { EventType, EventTypeValue }

export interface EventOccurrence {
  date: string // YYYY-MM-DD
  time: string // HH:mm
  type: OperationType
  description: string
}

function getDayOfWeekName(dayNumber: number): DayOfWeek {
  const days: DayOfWeek[] = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']
  return days[dayNumber]
}

export function calculateUnicoOccurrences(
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string,
  cleaningRule: CleaningRule,
): EventOccurrence[] {
  const occurrences: EventOccurrence[] = []

  const mobilizationTime = subtractHours(startTime, 4)
  occurrences.push({
    date: startDate,
    time: mobilizationTime,
    type: OperationType.MOBILIZATION,
    description: 'Mobilização do evento',
  })

  const start = new Date(startDate)
  const end = new Date(endDate)

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]

    occurrences.push({
      date: dateStr,
      time: cleaningRule.time,
      type: OperationType.CLEANING,
      description: 'Limpeza pós-uso',
    })
  }

  const demobilizationTime = addHours(endTime, 4)
  occurrences.push({
    date: endDate,
    time: demobilizationTime,
    type: OperationType.DEMOBILIZATION,
    description: 'Desmobilização do evento',
  })

  return occurrences
}

export function calculateIntermitenteOccurrences(
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string,
  cleaningRule: CleaningRule,
): EventOccurrence[] {
  const occurrences: EventOccurrence[] = []

  const mobilizationTime = subtractHours(startTime, 4)
  occurrences.push({
    date: startDate,
    time: mobilizationTime,
    type: OperationType.MOBILIZATION,
    description: 'Mobilização do evento',
  })

  if (cleaningRule.daysOfWeek && cleaningRule.daysOfWeek.length > 0) {
    const start = new Date(startDate)
    const end = new Date(endDate)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = getDayOfWeekName(d.getDay())

      if (cleaningRule.daysOfWeek.includes(dayOfWeek)) {
        const dateStr = d.toISOString().split('T')[0]

        occurrences.push({
          date: dateStr,
          time: cleaningRule.time,
          type: OperationType.CLEANING,
          description: `Limpeza (${dayOfWeek})`,
        })
      }
    }
  }

  const demobilizationTime = addHours(endTime, 4)
  occurrences.push({
    date: endDate,
    time: demobilizationTime,
    type: OperationType.DEMOBILIZATION,
    description: 'Desmobilização do evento',
  })

  return occurrences
}

export function calculateContinuoOccurrences(
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string,
  cleaningRule: CleaningRule,
): EventOccurrence[] {
  const occurrences: EventOccurrence[] = []

  const mobilizationTime = subtractHours(startTime, 4)
  occurrences.push({
    date: startDate,
    time: mobilizationTime,
    type: OperationType.MOBILIZATION,
    description: 'Mobilização do evento',
  })

  if (cleaningRule.daysOfWeek && cleaningRule.daysOfWeek.length > 0) {
    const start = new Date(startDate)
    const end = new Date(endDate)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = getDayOfWeekName(d.getDay())

      if (cleaningRule.daysOfWeek.includes(dayOfWeek)) {
        const dateStr = d.toISOString().split('T')[0]

        occurrences.push({
          date: dateStr,
          time: cleaningRule.time,
          type: OperationType.CLEANING,
          description: `Limpeza semanal (${dayOfWeek})`,
        })
      }
    }
  }

  const demobilizationTime = addHours(endTime, 4)
  occurrences.push({
    date: endDate,
    time: demobilizationTime,
    type: OperationType.DEMOBILIZATION,
    description: 'Desmobilização do evento',
  })

  return occurrences
}

export function calculateEventOccurrences(
  eventType: EventType,
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string,
  cleaningRule: CleaningRule,
): EventOccurrence[] {
  switch (eventType) {
    case EventType.UNIQUE:
      if (!cleaningRule || !cleaningRule.time) {
        throw new Error('Horário de limpeza pós-uso é obrigatório para eventos ÚNICO')
      }
      return calculateUnicoOccurrences(startDate, endDate, startTime, endTime, cleaningRule)

    case EventType.INTERMITTENT:
      if (!cleaningRule || !cleaningRule.daysOfWeek || cleaningRule.daysOfWeek.length === 0) {
        throw new Error('Dias da semana são obrigatórios para eventos INTERMITENTE')
      }
      if (!cleaningRule.time) {
        throw new Error('Horário de limpeza é obrigatório para eventos INTERMITENTE')
      }
      return calculateIntermitenteOccurrences(startDate, endDate, startTime, endTime, cleaningRule)

    case EventType.CONTINUOUS:
      if (!cleaningRule || !cleaningRule.daysOfWeek || cleaningRule.daysOfWeek.length === 0) {
        throw new Error('Dias da semana são obrigatórios para eventos CONTÍNUO')
      }
      if (!cleaningRule.time) {
        throw new Error('Horário de limpeza é obrigatório para eventos CONTÍNUO')
      }
      return calculateContinuoOccurrences(startDate, endDate, startTime, endTime, cleaningRule)

    default:
      throw new Error(`Tipo de evento desconhecido: ${eventType}`)
  }
}

export function calculateCustomDateOccurrences(
  dates: string[],
  startTime: string,
  endTime: string,
  cleaningRule?: CleaningRule,
): EventOccurrence[] {
  const occurrences: EventOccurrence[] = []
  const sortedDates = [...dates].sort()

  if (sortedDates.length === 0) {
    return occurrences
  }

  const firstDate = sortedDates[0]
  const lastDate = sortedDates[sortedDates.length - 1]

  const mobilizationTime = subtractHours(startTime, 4)
  occurrences.push({
    date: firstDate,
    time: mobilizationTime,
    type: OperationType.MOBILIZATION,
    description: 'Mobilização do evento',
  })

  sortedDates.forEach((date) => {
    const cleaningTime = cleaningRule?.time || '08:00'

    if (cleaningRule?.preUse) {
      const preCleaningTime = subtractHours(startTime, 3)
      occurrences.push({
        date,
        time: preCleaningTime,
        type: OperationType.CLEANING,
        description: 'Limpeza pré-uso',
      })
    }

    occurrences.push({
      date,
      time: cleaningTime,
      type: OperationType.CLEANING,
      description: 'Limpeza',
    })

    if (cleaningRule?.postUse) {
      const postCleaningTime = addHours(endTime, 1)
      occurrences.push({
        date,
        time: postCleaningTime,
        type: OperationType.CLEANING,
        description: 'Limpeza pós-uso',
      })
    }
  })

  const demobilizationTime = addHours(endTime, 4)
  occurrences.push({
    date: lastDate,
    time: demobilizationTime,
    type: OperationType.DEMOBILIZATION,
    description: 'Desmobilização do evento',
  })

  return occurrences
}

function subtractHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number)
  const totalMinutes = h * 60 + m - hours * 60
  const newHours = Math.floor(totalMinutes / 60)
  const newMinutes = totalMinutes % 60

  if (newHours < 0) {
    return '00:00'
  }

  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
}

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number)
  const totalMinutes = h * 60 + m + hours * 60
  const newHours = Math.floor(totalMinutes / 60) % 24
  const newMinutes = totalMinutes % 60

  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
}
