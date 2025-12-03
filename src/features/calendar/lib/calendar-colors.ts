import { OperationTypeColors } from '@/features/operations/config/operations-config'
import type { CalendarEvent, CalendarStyleConfig } from '../model/types'
import { CALENDAR_COLORS } from '../config/calendar-config'

export function getOperationColor(operationType: string): string {
  const colorClass =
    OperationTypeColors[operationType as keyof typeof OperationTypeColors]

  if (!colorClass) return CALENDAR_COLORS.DEFAULT

  if (colorClass.includes('teal')) return CALENDAR_COLORS.TEAL
  if (colorClass.includes('purple')) return CALENDAR_COLORS.PURPLE
  if (colorClass.includes('orange')) return CALENDAR_COLORS.ORANGE

  return CALENDAR_COLORS.DEFAULT
}

export function getEventStyle(event: CalendarEvent): { style: CalendarStyleConfig } {
  let backgroundColor: string = CALENDAR_COLORS.DEFAULT

  if (event.type === 'operation' && event.operationType) {
    backgroundColor = getOperationColor(event.operationType)
  }

  return {
    style: {
      backgroundColor,
      color: CALENDAR_COLORS.TEXT,
      cursor: 'pointer',
      borderRadius: '5px',
      opacity: 0.95,
      border: 'none',
      display: 'block',
    },
  }
}
