import { EventType, EventTypeLabels, EventTypeColors } from '@/features/events/config/event-types'
import { EventStatus, EventStatusLabels, EventStatusColors } from '@/features/events/config/event-status'

const eventTypeToEnum: Record<string, EventType> = {
  SINGLE_OCCURRENCE: EventType.UNIQUE,
  INTERMITENTE: EventType.INTERMITTENT,
  unique: EventType.UNIQUE,
  intermittent: EventType.INTERMITTENT,
  UNICO: EventType.UNIQUE,
}

const statusToEnum: Record<string, EventStatus> = {
  draft: EventStatus.DRAFT,
  received: EventStatus.RECEIVED,
  verified: EventStatus.VERIFIED,
  confirmed: EventStatus.CONFIRMED,
  active: EventStatus.ACTIVE,
  scheduled: EventStatus.SCHEDULED,
  in_progress: EventStatus.IN_PROGRESS,
  completed: EventStatus.COMPLETED,
  billed: EventStatus.BILLED,
  cancelled: EventStatus.CANCELLED,
  incomplete: EventStatus.INCOMPLETE,
  time_error: EventStatus.TIME_ERROR,
  DRAFT: EventStatus.DRAFT,
  RECEIVED: EventStatus.RECEIVED,
  VERIFIED: EventStatus.VERIFIED,
  CONFIRMED: EventStatus.CONFIRMED,
  ACTIVE: EventStatus.ACTIVE,
  SCHEDULED: EventStatus.SCHEDULED,
  IN_PROGRESS: EventStatus.IN_PROGRESS,
  COMPLETED: EventStatus.COMPLETED,
  BILLED: EventStatus.BILLED,
  CANCELLED: EventStatus.CANCELLED,
  INCOMPLETE: EventStatus.INCOMPLETE,
  TIME_ERROR: EventStatus.TIME_ERROR,
}

export function getEventTypeLabel(type: string): string {
  const enumKey = eventTypeToEnum[type]
  return enumKey ? EventTypeLabels[enumKey] : type
}

export function getEventTypeEnum(type: string): EventType | undefined {
  return eventTypeToEnum[type]
}

export function getEventTypeColor(type: string): string {
  const enumKey = eventTypeToEnum[type]
  return enumKey
    ? EventTypeColors[enumKey]
    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
}

export function getEventStatusLabel(status: string): string {
  const enumKey = statusToEnum[status]
  return enumKey ? EventStatusLabels[enumKey] : status
}

export function getStatusColor(status: string): string {
  const enumKey = statusToEnum[status]
  return enumKey
    ? EventStatusColors[enumKey]
    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
}
