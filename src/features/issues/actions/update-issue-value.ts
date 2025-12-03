'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logger } from '@/shared/lib/logger'
import type { ResolveIssueResult } from './resolve-issue'
import { ROUTES } from '@/shared/config'

export interface UpdateIssueValueInput {
  issueId: string
  eventId: string
  fieldName: string
  newValue: string
  autoResolve?: boolean
}

export async function updateIssueValue({
  issueId,
  eventId,
  fieldName,
  newValue,
  autoResolve = true,
}: UpdateIssueValueInput): Promise<ResolveIssueResult> {
  try {
    const supabase = await createClient()

    const { data: issue, error: fetchError } = await supabase
      .from('new_issues')
      .select('*')
      .eq('id', issueId)
      .single()

    if (fetchError || !issue) {
      return { success: false, error: 'Issue não encontrado' }
    }

    const updateData: Record<string, unknown> = {}
    updateData[fieldName] = newValue

    const { error: updateEventError } = await supabase
      .from('new_events')
      .update(updateData)
      .eq('id', eventId)

    if (updateEventError) {
      logger.error('Error updating event field', updateEventError, {
        eventId,
        fieldName,
      })
      return { success: false, error: 'Erro ao atualizar campo do evento' }
    }

    if (autoResolve) {
      const { error: resolveError } = await supabase
        .from('new_issues')
        .update({
          status: 'RESOLVED',
          resolved_at: new Date().toISOString(),
          current_value: newValue,
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
    }

    revalidatePath(ROUTES.EVENT_DETAILS(eventId))

    return {
      success: true,
      message: `Campo "${fieldName}" atualizado com sucesso`,
    }
  } catch (error) {
    logger.error(
      'Unexpected error updating issue value',
      error instanceof Error ? error : new Error(String(error)),
    )
    return { success: false, error: 'Erro inesperado ao atualizar valor' }
  }
}
