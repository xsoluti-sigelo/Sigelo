'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logger } from '@/shared/lib/logger'
import type { ResolveIssueResult } from './resolve-issue'
import { ROUTES } from '@/shared/config'

export async function ignoreIssue(
  issueId: string,
  eventId: string,
  notes?: string,
): Promise<ResolveIssueResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('new_issues')
      .update({
        status: 'IGNORED',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', issueId)

    if (error) {
      logger.error('Error ignoring issue', error, {
        issueId,
        eventId,
      })
      return { success: false, error: 'Erro ao ignorar issue' }
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

    if (notes) {
      logger.info('Issue ignored with notes', { issueId, notes })
    }

    revalidatePath(ROUTES.EVENT_DETAILS(eventId))

    return {
      success: true,
      message: 'Issue ignorado com sucesso',
    }
  } catch (error) {
    logger.error(
      'Unexpected error ignoring issue',
      error instanceof Error ? error : new Error(String(error)),
    )
    return { success: false, error: 'Erro inesperado ao ignorar issue' }
  }
}
