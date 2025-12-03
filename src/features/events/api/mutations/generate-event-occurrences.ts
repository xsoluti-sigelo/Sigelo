'use server'

import { createClient } from '@/shared/lib/supabase/server'
import {
  calculateEventOccurrences,
  calculateCustomDateOccurrences,
  type EventType,
  type EventOccurrence,
} from '../../lib/event-recurrence.service'
import type { CleaningRule } from '../../config/events-config'

export interface GenerateEventOccurrencesInput {
  eventId: string
}

export interface GenerateEventOccurrencesResult {
  success: boolean
  occurrences?: EventOccurrence[]
  operationsCreated?: number
  error?: string
}

export async function generateEventOccurrences(
  input: GenerateEventOccurrencesInput,
): Promise<GenerateEventOccurrencesResult> {
  const supabase = await createClient()

  try {
    const { data: event, error: eventError } = (await supabase
      .from('new_events')
      .select('*')
      .eq('id', input.eventId)
      .single()) as {
      data: {
        id: string
        name: string
        start_date: string
        end_date: string
        start_time: string
        end_time: string
        event_type: EventType | null
        cleaning_rule: CleaningRule | null
        daily_list: string[] | null
        location: string
      } | null
      error: unknown
    }

    if (eventError || !event) {
      return {
        success: false,
        error: 'Evento não encontrado',
      }
    }

    if (!event.start_date || !event.end_date || !event.start_time || !event.end_time) {
      return {
        success: false,
        error: 'Evento deve ter data e horário de início e fim',
      }
    }

    let occurrences: EventOccurrence[] = []

    if (event.daily_list && event.daily_list.length > 0) {
      occurrences = calculateCustomDateOccurrences(
        event.daily_list,
        event.start_time,
        event.end_time,
        event.cleaning_rule || undefined,
      )
    } else if (event.event_type && event.cleaning_rule) {
      occurrences = calculateEventOccurrences(
        event.event_type,
        event.start_date,
        event.end_date,
        event.start_time,
        event.end_time,
        event.cleaning_rule,
      )
    } else {
      return {
        success: false,
        error: 'Evento deve ter um tipo (ÚNICO, INTERMITENTE ou CONTÍNUO) ou lista de datas',
      }
    }

    let operationsCreated = 0

    for (const occurrence of occurrences) {
      const operationDateTime = `${occurrence.date}T${occurrence.time}:00`

      const { error: insertError } = await supabase.from('molide_operations' as never).insert({
        event_id: event.id,
        operation_type: occurrence.type,
        scheduled_datetime: operationDateTime,
        status: 'PENDING',
        location: event.location,
        notes: occurrence.description,
        created_at: new Date().toISOString(),
      } as never)

      if (!insertError) {
        operationsCreated++
      }
    }

    return {
      success: true,
      occurrences,
      operationsCreated,
    }
  } catch {
    return {
      success: false,
      error: 'Erro ao gerar ocorrências do evento',
    }
  }
}

export async function previewEventOccurrences(
  input: GenerateEventOccurrencesInput,
): Promise<GenerateEventOccurrencesResult> {
  const supabase = await createClient()

  try {
    const { data: event, error: eventError } = (await supabase
      .from('new_events')
      .select('*')
      .eq('id', input.eventId)
      .single()) as {
      data: {
        id: string
        start_date: string
        end_date: string
        start_time: string
        end_time: string
        event_type: EventType | null
        cleaning_rule: CleaningRule | null
        daily_list: string[] | null
      } | null
      error: unknown
    }

    if (eventError || !event) {
      return {
        success: false,
        error: 'Evento não encontrado',
      }
    }

    if (!event.start_date || !event.end_date || !event.start_time || !event.end_time) {
      return {
        success: false,
        error: 'Evento deve ter data e horário de início e fim',
      }
    }

    let occurrences: EventOccurrence[] = []

    if (event.daily_list && event.daily_list.length > 0) {
      occurrences = calculateCustomDateOccurrences(
        event.daily_list,
        event.start_time,
        event.end_time,
        event.cleaning_rule || undefined,
      )
    } else if (event.event_type && event.cleaning_rule) {
      occurrences = calculateEventOccurrences(
        event.event_type,
        event.start_date,
        event.end_date,
        event.start_time,
        event.end_time,
        event.cleaning_rule,
      )
    } else {
      return {
        success: false,
        error: 'Evento deve ter um tipo (ÚNICO, INTERMITENTE ou CONTÍNUO) ou lista de datas',
      }
    }

    return {
      success: true,
      occurrences,
    }
  } catch {
    return {
      success: false,
      error: 'Erro ao visualizar ocorrências do evento',
    }
  }
}
