'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logger } from '@/shared/lib/logger'
import type { ResolveIssueResult } from './resolve-issue'
import { ROUTES } from '@/shared/config'

export interface UpdateEventTimeInput {
  issueId: string
  eventId: string
  startTime: string
  endTime: string
}

export async function updateEventTime({
  issueId,
  eventId,
  startTime,
  endTime,
}: UpdateEventTimeInput): Promise<ResolveIssueResult> {
  try {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return { success: false, error: 'Formato de horário inválido. Use HH:MM' }
    }

    const supabase = await createClient()

    const { error: updateError } = await supabase
      .from('new_events')
      .update({
        start_time: `${startTime}:00`,
        end_time: `${endTime}:00`,
      })
      .eq('id', eventId)

    if (updateError) {
      logger.error('Error updating event times', updateError, { eventId })
      return { success: false, error: 'Erro ao atualizar horários do evento' }
    }

    const { error: resolveError } = await supabase
      .from('new_issues')
      .update({
        status: 'RESOLVED',
        resolved_at: new Date().toISOString(),
        current_value: `${startTime} - ${endTime}`,
      })
      .eq('id', issueId)

    if (resolveError) {
      logger.error('Error resolving issue', resolveError, { issueId })
      return { success: false, error: 'Erro ao resolver issue' }
    }

    const { data: remainingIssues } = await supabase
      .from('new_issues')
      .select('id')
      .eq('event_id', eventId)
      .in('status', ['OPEN', 'IN_REVIEW'])

    if (remainingIssues && remainingIssues.length === 0) {
      await supabase.from('new_events').update({ status: 'DRAFT' }).eq('id', eventId)

      await supabase
        .from('new_operations')
        .update({ status: 'SCHEDULED' })
        .eq('event_id', eventId)
        .eq('status', 'RECEIVED')
    }

    revalidatePath(ROUTES.EVENT_DETAILS(eventId))

    return {
      success: true,
      message: 'Horários atualizados com sucesso',
    }
  } catch (error) {
    logger.error(
      'Unexpected error updating event time',
      error instanceof Error ? error : new Error(String(error)),
    )
    return { success: false, error: 'Erro inesperado ao atualizar horários' }
  }
}
