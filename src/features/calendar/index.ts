export { CalendarView, CalendarHeader, CalendarStyles } from './components'

export { getCalendarOperations } from './actions/get-calendar-operations'

export { useCalendarOperations, useCalendarNavigation } from './hooks'

export { CalendarService, calendarService } from './services/calendar.service'

export type {
  CalendarEvent,
  CalendarOperationData,
  CalendarDateRange,
  CalendarViewState,
  CalendarOperationsParams,
  CalendarStyleConfig,
  CalendarView as CalendarViewType,
} from './model/types'

export {
  calendarOperationDataSchema,
  calendarEventSchema,
  calendarDateRangeSchema,
  calendarOperationsParamsSchema,
} from './model/calendar-schemas'

export type {
  CalendarOperationDataInput,
  CalendarEventInput,
  CalendarDateRangeInput,
  CalendarOperationsParamsInput,
} from './model/calendar-schemas'

export { getOperationColor, getEventStyle, calendarLocalizer } from './lib'

export { CALENDAR_COLORS, CALENDAR_MESSAGES, CALENDAR_CULTURE } from './config'
