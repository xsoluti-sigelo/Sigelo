'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { CalendarService } from '../services/calendar.service'
import type { CalendarEvent, CalendarOperationData } from '../model/types'

export async function getCalendarOperations(
  startDate: string,
  endDate: string,
): Promise<CalendarEvent[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('new_operations')
    .select(
      `
      id,
      type,
      date,
      time,
      status,
      new_events!inner(number, name)
    `,
    )
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')

  if (error) {
    throw new Error(`Failed to fetch calendar operations: ${error.message}`)
  }

  const operations = (data as unknown as CalendarOperationData[]) || []
  return CalendarService.transformOperationsToEvents(operations)
}
