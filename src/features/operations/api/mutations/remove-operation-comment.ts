'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  removeOperationCommentSchema,
  type RemoveOperationCommentInput,
} from '@/features/operations/lib/validations'
import { createAdminClient } from '@/shared/lib/supabase/admin'

type Result =
  | { success: true }
  | { success: false; error: string; errors?: Record<string, string[]> }

export async function removeOperationComment(input: RemoveOperationCommentInput): Promise<Result> {
  const result = removeOperationCommentSchema.safeParse(input)

  if (!result.success) {
    return {
      success: false,
      error: 'ID inválido.',
      errors: result.error.flatten().fieldErrors,
    }
  }

  const { commentId, operationId } = result.data
  const supabase = await createClient()
  const admin = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  const { data: userData } = await admin
    .from('users')
    .select('id, tenant_id, role')
    .eq('google_id', user.id)
    .single()

  const tenantId = userData?.tenant_id
  const role = userData?.role

  if (!tenantId) {
    return { success: false, error: 'Tenant não encontrado' }
  }

  const { data: targetComment } = await admin
    .from('operation_comments')
    .select('id, user_id, tenant_id')
    .eq('id', commentId)
    .maybeSingle()

  if (!targetComment || targetComment.tenant_id !== tenantId) {
    return { success: false, error: 'Comentário não encontrado ou sem permissão' }
  }

  if (role !== 'ADMIN' && targetComment.user_id !== userData.id) {
    return { success: false, error: 'Você não tem permissão para remover este comentário' }
  }

  const { data: softDeleted, error: softDeleteError } = await admin
    .from('operation_comments')
    .update({ is_deleted: true })
    .eq('id', commentId)
    .eq('tenant_id', tenantId)
    .select('id')
    .maybeSingle()

  if (softDeleteError && softDeleteError.code !== 'PGRST116') {
    return { success: false, error: 'Erro ao remover comentário' }
  }

  let removed = Boolean(softDeleted)

  if (!removed && role === 'ADMIN') {
    const { data: deleted, error: deleteError } = await admin
      .from('operation_comments')
      .delete()
      .eq('id', commentId)
      .eq('tenant_id', tenantId)
      .select('id')
      .maybeSingle()

    if (deleteError && deleteError.code !== 'PGRST116') {
      return { success: false, error: 'Erro ao remover comentário' }
    }

    removed = Boolean(deleted)
  }

  if (!removed) {
    return { success: false, error: 'Comentário não encontrado ou sem permissão' }
  }

  revalidatePath(`/operacoes/${operationId}`)

  return { success: true }
}
