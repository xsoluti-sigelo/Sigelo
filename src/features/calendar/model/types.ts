import type { View } from 'react-big-calendar'

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'operation'
  status?: string | null
  operationType?: string
  eventNumber?: string
  eventName?: string
}

export interface CalendarOperationData {
  id: string
  type: string
  date: string
  time: string
  status: string | null
  new_events: {
    number: string
    name: string
  }
}

export interface CalendarDateRange {
  start: Date
  end: Date
}

export interface CalendarViewState {
  view: View
  date: Date
}

export interface CalendarOperationsParams {
  startDate: string
  endDate: string
}

export interface CalendarStyleConfig {
  backgroundColor: string
  color: string
  cursor: string
  borderRadius: string
  opacity: number
  border: string
  display: string
}

export type CalendarView = View
