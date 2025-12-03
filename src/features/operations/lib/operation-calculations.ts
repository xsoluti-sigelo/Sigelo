import type { Database } from '@/types/database.types'
import { createUTCDate, formatUTCDate, addDays } from './operation-utils'

type NewOperationInsert = Database['public']['Tables']['new_operations']['Insert']
export type OperationData = Omit<NewOperationInsert, 'id' | 'created_at' | 'updated_at'>

interface CleaningGenerationParams {
  startDate: string
  endDate: string
  cleaningTime: string
  demobTime: { date: string; time: string } | { time: string; dayOffset: number }
  demobDate: string
  tenant_id: string
  mobilizationDate?: string
  mobilizationTime?: string
  shouldIncludeDate?: (date: Date) => boolean
}

function generateCleaningsBase(params: CleaningGenerationParams): Omit<OperationData, 'event_id'>[] {
  const {
    startDate,
    endDate,
    cleaningTime,
    demobTime,
    demobDate,
    tenant_id,
    mobilizationDate,
    mobilizationTime,
    shouldIncludeDate = () => true,
  } = params

  const cleanings: Omit<OperationData, 'event_id'>[] = []
  const start = createUTCDate(startDate)
  const end = createUTCDate(endDate)
  const currentDate = new Date(start.getTime())

  let demobDateStr: string
  let demobTimeStr: string

  if ('date' in demobTime) {
    demobDateStr = demobTime.date
    demobTimeStr = demobTime.time
  } else {
    demobDateStr = addDays(demobDate, demobTime.dayOffset)
    demobTimeStr = demobTime.time
  }

  const demobDateTime = new Date(`${demobDateStr}T${demobTimeStr}:00`)

  while (currentDate.getTime() <= end.getTime()) {
    if (!shouldIncludeDate(currentDate)) {
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
      continue
    }

    const dateStr = formatUTCDate(currentDate)
    const cleaningDateTime = new Date(`${dateStr}T${cleaningTime}:00`)

    if (mobilizationDate && mobilizationTime && dateStr === mobilizationDate) {
      const [cleanHour, cleanMin] = cleaningTime.split(':').map(Number)
      const [mobHour, mobMin] = mobilizationTime.split(':').map(Number)
      const cleanMinutes = cleanHour * 60 + cleanMin
      const mobMinutes = mobHour * 60 + mobMin

      if (cleanMinutes < mobMinutes) {
        currentDate.setUTCDate(currentDate.getUTCDate() + 1)
        continue
      }
    }

    if (dateStr === demobDateStr) {
      const [cleanHour, cleanMin] = cleaningTime.split(':').map(Number)
      const [demobHour, demobMin] = demobTimeStr.split(':').map(Number)
      const cleanMinutes = cleanHour * 60 + cleanMin
      const demobMinutes = demobHour * 60 + demobMin

      if (cleanMinutes > demobMinutes) {
        currentDate.setUTCDate(currentDate.getUTCDate() + 1)
        continue
      }
    }

    const [demobHour, demobMinute] = demobTimeStr.split(':').map(Number)
    const isDemobMidnight = demobHour === 0 && demobMinute === 0

    let shouldCreateCleaning = false
    if (isDemobMidnight && dateStr === demobDateStr) {
      const cleaningHour = parseInt(cleaningTime.split(':')[0])
      shouldCreateCleaning = cleaningHour >= 6
    } else {
      shouldCreateCleaning = cleaningDateTime < demobDateTime
    }

    if (shouldCreateCleaning) {
      cleanings.push({
        tenant_id,
        type: 'CLEANING',
        subtype: 'post_use',
        date: dateStr,
        time: cleaningTime,
        duration: 60,
        vehicle_type: 'TANQUE',
        status: 'SCHEDULED' as const,
        notes: 'Limpeza pós-uso',
      })
    }

    currentDate.setUTCDate(currentDate.getUTCDate() + 1)
  }

  if (cleanings.length > 0) {
    const lastCleaning = cleanings[cleanings.length - 1]
    lastCleaning.type = 'SUCTION'
    lastCleaning.notes = 'Sucção final'
  }

  return cleanings
}

export function generateDailyCleanings(
  startDate: string,
  endDate: string,
  cleaningTime: string,
  demobTime: { date: string; time: string } | { time: string; dayOffset: number },
  demobDate: string,
  tenant_id: string,
  mobilizationDate?: string,
  mobilizationTime?: string,
): Omit<OperationData, 'event_id'>[] {
  return generateCleaningsBase({
    startDate,
    endDate,
    cleaningTime,
    demobTime,
    demobDate,
    tenant_id,
    mobilizationDate,
    mobilizationTime,
  })
}

export function generateWeeklyCleanings(
  startDate: string,
  endDate: string,
  daysOfWeek: string[],
  cleaningTime: string,
  demobTime: { date: string; time: string } | { time: string; dayOffset: number },
  tenant_id: string,
  mobilizationDate?: string,
  mobilizationTime?: string,
): Omit<OperationData, 'event_id'>[] {
  const dayMap: Record<string, number> = {
    DOM: 0,
    SEG: 1,
    TER: 2,
    QUA: 3,
    QUI: 4,
    SEX: 5,
    SAB: 6,
  }

  const targetDays = daysOfWeek.map((d) => dayMap[d]).filter((d) => d !== undefined)

  return generateCleaningsBase({
    startDate,
    endDate,
    cleaningTime,
    demobTime,
    demobDate: endDate,
    tenant_id,
    mobilizationDate,
    mobilizationTime,
    shouldIncludeDate: (date) => targetDays.includes(date.getUTCDay()),
  })
}
