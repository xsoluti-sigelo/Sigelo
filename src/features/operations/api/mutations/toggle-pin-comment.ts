'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { UserRole } from '@/shared/config/enums'

type Result = { success: true } | { success: false; error: string }

export async function togglePinComment(
  commentId: string,
  operationId: string,
  isPinned: boolean
): Promise<Result> {
  const supabase = await createClient()
  const admin = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  const { data: userData, error: userError } = await admin
    .from('users')
    .select('id, tenant_id, role')
    .eq('google_id', user.id)
    .single()

  if (userError || !userData?.tenant_id) {
    return { success: false, error: 'Tenant não encontrado' }
  }

  if (userData.role !== UserRole.ADMIN) {
    return { success: false, error: 'Apenas administradores podem fixar comentários' }
  }

  if (isPinned) {
    await admin
      .from('operation_comments')
      .update({ is_pinned: false })
      .eq('operation_id', operationId)
      .eq('tenant_id', userData.tenant_id)
      .eq('is_pinned', true)
  }

  const { error } = await admin
    .from('operation_comments')
    .update({ is_pinned: isPinned })
    .eq('id', commentId)
    .eq('tenant_id', userData.tenant_id)

  if (error) {
    return { success: false, error: 'Erro ao atualizar comentário' }
  }

  revalidatePath(`/operacoes/${operationId}`)

  return { success: true }
}
