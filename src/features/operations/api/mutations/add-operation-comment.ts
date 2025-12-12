'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  operationCommentSchema,
  type OperationCommentInput,
} from '@/features/operations/lib/validations'
import type { OperationComment } from '@/features/operations/model/operation-types'
import { createAdminClient } from '@/shared/lib/supabase/admin'

type Result =
  | { success: true; comment: OperationComment }
  | { success: false; error: string; errors?: Record<string, string[]> }

export async function addOperationComment(input: OperationCommentInput): Promise<Result> {
  const validation = operationCommentSchema.safeParse(input)

  if (!validation.success) {
    return {
      success: false,
      error: 'Dados inválidos.',
      errors: validation.error.flatten().fieldErrors,
    }
  }

  const { operationId, comment } = validation.data
  const supabase = await createClient()
  const admin = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  const { data: userData, error: tenantError } = await admin
    .from('users')
    .select('id, tenant_id, full_name, email, picture_url')
    .eq('google_id', user.id)
    .single()

  if (tenantError || !userData?.tenant_id) {
    return { success: false, error: 'Tenant não encontrado' }
  }

  const { data, error } = await admin
    .from('operation_comments')
    .insert({
      operation_id: operationId,
      tenant_id: userData.tenant_id,
      user_id: userData.id,
      comment_text: comment.trim(),
    })
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
    .single()

  if (error || !data) {
    return { success: false, error: 'Erro ao adicionar comentário' }
  }

  revalidatePath(`/operacoes/${operationId}`)

  return { success: true, comment: data as OperationComment }
}
