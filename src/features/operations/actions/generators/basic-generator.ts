import {
  parseDateTimeField,
  subtractHours,
  addHours,
  addDays,
  generateDailyCleanings,
  generateWeeklyCleanings,
} from '../../domain'
import type { OperationData } from '../../lib/operation-calculations'
import type { GenerateOperationsResult } from '../../types/operation.types'
import type { EventRow, SupabaseClient, UserContext } from '../../model/shared-types'
import { replaceEventOperations } from '../services/operations-replacer'
import { OperationType } from '../../config/operations-config'
import { EventType as EventTypeEnum } from '@/features/events/config/event-types'

const EVENT_TYPE_SINGLE = EventTypeEnum.UNIQUE
const EVENT_TYPE_INTERMITTENT = EventTypeEnum.INTERMITTENT
const EVENT_TYPE_LEGACY_UNICO = 'UNICO'

export async function generateBasicOperations(
  supabase: SupabaseClient,
  event: EventRow,
  eventId: string,
  userData: UserContext,
): Promise<GenerateOperationsResult> {
  const operations: OperationData[] = []

  const startDate = event.start_date
  const endDate = event.end_date || event.start_date
  const startTime = event.start_time?.replace(/:00$/, '') || '00:00'
  const endTime = event.end_time?.replace(/:00$/, '') || '00:00'
  const mobilizationDateTime = parseDateTimeField(event.mobilization_datetime)
  const demobilizationDateTime = parseDateTimeField(event.demobilization_datetime)
  const eventType = event.event_type
  const cleaningRule = event.cleaning_rule as
    | { type: 'daily'; time: string }
    | { type: 'weekly'; daysOfWeek: string[]; time: string }
    | null


  let mobDate: string
  let mobTime: string

  if (event.source === 'MANUAL') {
    mobDate = startDate
    mobTime = startTime
    operations.push({
      tenant_id: userData.tenant_id,
      event_id: eventId,
      type: OperationType.MOBILIZATION,
      date: mobDate,
      time: mobTime,
      duration: 60,
      vehicle_type: 'CARGA',
      status: 'SCHEDULED' as const,
      notes: 'Instalação inicial dos equipamentos',
    })
  } else if (mobilizationDateTime) {
    mobDate = mobilizationDateTime.date
    mobTime = mobilizationDateTime.time
    operations.push({
      tenant_id: userData.tenant_id,
      event_id: eventId,
      type: OperationType.MOBILIZATION,
      date: mobDate,
      time: mobTime,
      duration: 60,
      vehicle_type: 'CARGA',
      status: 'SCHEDULED' as const,
      notes: 'Instalação inicial dos equipamentos',
    })
  } else {
    const mobTimeResult = subtractHours(startTime, 4)
    mobDate = addDays(startDate, mobTimeResult.dayOffset)
    mobTime = mobTimeResult.time
    operations.push({
      tenant_id: userData.tenant_id,
      event_id: eventId,
      type: OperationType.MOBILIZATION,
      date: mobDate,
      time: mobTime,
      duration: 60,
      vehicle_type: 'CARGA',
      status: 'SCHEDULED' as const,
      notes: 'Instalação inicial dos equipamentos',
    })
  }

  if (cleaningRule) {
    const cleaningTime = cleaningRule.time || '19:00'

    const demobTime =
      event.source === 'MANUAL'
        ? { date: endDate, time: endTime }
        : demobilizationDateTime || addHours(endTime, 4)

    if ((eventType === EVENT_TYPE_SINGLE || eventType === EVENT_TYPE_LEGACY_UNICO) && cleaningRule.type === 'daily') {

      const cleanings = generateDailyCleanings(
        startDate,
        endDate,
        cleaningTime,
        demobTime,
        endDate,
        userData.tenant_id,
        mobDate,
        mobTime,
      )

      operations.push(...cleanings.map((c) => ({ ...c, event_id: eventId })))
    } else if (
      eventType === EVENT_TYPE_INTERMITTENT &&
      cleaningRule.type === 'weekly' &&
      cleaningRule.daysOfWeek
    ) {
      const cleanings = generateWeeklyCleanings(
        startDate,
        endDate,
        cleaningRule.daysOfWeek,
        cleaningTime,
        demobTime,
        userData.tenant_id,
        mobDate,
        mobTime,
      )
      operations.push(...cleanings.map((c) => ({ ...c, event_id: eventId })))
    }
  }

  if (event.source === 'MANUAL') {
    operations.push({
      tenant_id: userData.tenant_id,
      event_id: eventId,
      type: OperationType.DEMOBILIZATION,
      date: endDate,
      time: endTime,
      duration: 60,
      vehicle_type: 'CARGA',
      status: 'SCHEDULED' as const,
      notes: 'Retirada final dos equipamentos',
    })
  } else if (demobilizationDateTime) {
    operations.push({
      tenant_id: userData.tenant_id,
      event_id: eventId,
      type: 'DEMOBILIZATION' as const,
      date: demobilizationDateTime.date,
      time: demobilizationDateTime.time,
      duration: 60,
      vehicle_type: 'CARGA',
      status: 'SCHEDULED' as const,
      notes: 'Retirada final dos equipamentos',
    })
  } else {
    const demobTime = addHours(endTime, 4)
    operations.push({
      tenant_id: userData.tenant_id,
      event_id: eventId,
      type: 'DEMOBILIZATION' as const,
      date: addDays(endDate, demobTime.dayOffset),
      time: demobTime.time,
      duration: 60,
      vehicle_type: 'CARGA',
      status: 'SCHEDULED' as const,
      notes: 'Retirada final dos equipamentos',
    })
  }

  const result = await replaceEventOperations(supabase, eventId, operations, userData, {
    generator: 'deterministic',
    context: {
      event_type: event.event_type,
      source: event.source,
    },
  })
  return result
}
