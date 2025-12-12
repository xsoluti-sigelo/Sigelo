'use server'

import { createClient } from '@/shared/lib/supabase/server'
import type { OperationComment } from '../../model/operation-types'
import { logger } from '@/shared/lib/logger'

export async function getOperationComments(operationId: string): Promise<OperationComment[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('operation_comments')
    .select(
      `
      id,
      operation_id,
      tenant_id,
      user_id,
      comment_text,
      created_at,
      updated_at,
      is_deleted,
      is_pinned,
      users!fk_operation_comments_user (
        id,
        full_name,
        email,
        picture_url
      )
    `,
    )
    .eq('operation_id', operationId)
    .eq('is_deleted', false)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('Error fetching operation comments', { error })
    return []
  }

  return (data || []) as OperationComment[]
}
