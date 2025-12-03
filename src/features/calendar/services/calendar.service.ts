import { addMonths, startOfMonth, endOfMonth, format } from 'date-fns'
import { getOperationTypeLabel } from '@/features/operations/config/operations-config'
import type { CalendarEvent, CalendarOperationData, CalendarDateRange } from '../model/types'

export class CalendarService {
  static getDateRange(currentDate: Date): CalendarDateRange {
    const start = startOfMonth(addMonths(currentDate, -1))
    const end = endOfMonth(addMonths(currentDate, 1))

    return { start, end }
  }

  static formatDateRange(range: CalendarDateRange): { startDate: string; endDate: string } {
    return {
      startDate: format(range.start, 'yyyy-MM-dd'),
      endDate: format(range.end, 'yyyy-MM-dd'),
    }
  }

  static transformOperationToEvent(operation: CalendarOperationData): CalendarEvent {
    const dateTime = `${operation.date}T${operation.time}`
    const eventName = operation.new_events.name
    const typeLabel = getOperationTypeLabel(operation.type)

    const time = operation.time.substring(0, 5)
    const displayTitle = `${time} ${typeLabel} - ${eventName}`

    return {
      id: operation.id,
      title: displayTitle,
      start: new Date(dateTime),
      end: new Date(dateTime),
      type: 'operation',
      status: operation.status,
      operationType: operation.type,
      eventNumber: operation.new_events.number,
      eventName: operation.new_events.name,
    }
  }

  static transformOperationsToEvents(operations: CalendarOperationData[]): CalendarEvent[] {
    return operations.map((op) => this.transformOperationToEvent(op))
  }
}

export const calendarService = new CalendarService()
