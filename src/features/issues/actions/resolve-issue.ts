'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logger } from '@/shared/lib/logger'
import { ROUTES } from '@/shared/config'

export interface ResolveIssueResult {
  success: boolean
  error?: string
  message?: string
}

export async function resolveIssue(
  issueId: string,
  eventId: string,
  resolutionNotes?: string,
): Promise<ResolveIssueResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('new_issues')
      .update({
        status: 'RESOLVED',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', issueId)

    if (error) {
      logger.error('Error resolving issue', error, {
        issueId,
        eventId,
      })
      return { success: false, error: 'Erro ao resolver issue' }
    }

    const { data: remainingIssues, error: checkError } = await supabase
      .from('new_issues')
      .select('id')
      .eq('event_id', eventId)
      .in('status', ['OPEN', 'IN_REVIEW'])

    if (!checkError && remainingIssues && remainingIssues.length === 0) {
      await supabase.from('new_events').update({ status: 'DRAFT' }).eq('id', eventId)

      await supabase
        .from('new_operations')
        .update({ status: 'SCHEDULED' })
        .eq('event_id', eventId)
        .eq('status', 'RECEIVED')
    }

    if (resolutionNotes) {
      logger.info('Issue resolved with notes', { issueId, resolutionNotes })
    }

    revalidatePath(ROUTES.EVENT_DETAILS(eventId))

    return {
      success: true,
      message: 'Issue resolvido com sucesso',
    }
  } catch (error) {
    logger.error(
      'Unexpected error resolving issue',
      error instanceof Error ? error : new Error(String(error)),
    )
    return { success: false, error: 'Erro inesperado ao resolver issue' }
  }
}
