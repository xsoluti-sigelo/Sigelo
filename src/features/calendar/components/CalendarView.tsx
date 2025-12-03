'use client'

import { useState } from 'react'
import { Calendar, View } from 'react-big-calendar'
import { useCalendarOperations, useCalendarNavigation } from '../hooks'
import { calendarLocalizer, getEventStyle } from '../lib'
import { CALENDAR_MESSAGES, CALENDAR_CULTURE } from '../config'
import { CalendarHeader } from './CalendarHeader'
import { CalendarStyles } from './CalendarStyles'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const calendarComponents = {
  month: {
    dateHeader: ({ label }: { label: string }) => (
      <div className="rbc-date-cell-custom">{label}</div>
    ),
  },
}

export function CalendarView() {
  const [calendarView, setCalendarView] = useState<View>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  const { events, loading } = useCalendarOperations(currentDate)
  const { navigateToOperation } = useCalendarNavigation()

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <CalendarHeader />

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Carregando operações...</p>
            </div>
          </div>
        ) : (
          <div className="calendar-container overflow-auto" style={{ height: '700px' }}>
            <Calendar
              localizer={calendarLocalizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{
                height: calendarView === 'agenda' ? 'auto' : '100%',
                minHeight: '100%',
              }}
              culture={CALENDAR_CULTURE}
              date={currentDate}
              messages={CALENDAR_MESSAGES}
              view={calendarView}
              onView={setCalendarView}
              onNavigate={setCurrentDate}
              onSelectEvent={navigateToOperation}
              eventPropGetter={getEventStyle}
              components={calendarComponents}
              popup
              popupOffset={{ x: 0, y: 10 }}
              doShowMoreDrillDown={false}
            />
          </div>
        )}
      </div>

      <CalendarStyles />
    </div>
  )
}
