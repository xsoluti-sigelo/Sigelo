'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import type { OperationComment } from '../../model/operation-types'
import { logger } from '@/shared/lib/logger'

export async function getOperationComments(operationId: string): Promise<OperationComment[]> {
  const supabase = await createClient()
  const admin = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: userData } = await admin
    .from('users')
    .select('tenant_id')
    .eq('google_id', user.id)
    .single()

  if (!userData?.tenant_id) {
    throw new Error('Tenant not found')
  }

  const { data, error } = await admin
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
    .eq('tenant_id', userData.tenant_id)
    .eq('is_deleted', false)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('Error fetching operation comments', { error })
    return []
  }

  return (data || []) as OperationComment[]
}
