'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { getUserData, requireAdminPermission } from '@/entities/user'
import { createActivityLog } from '@/features/logs'
import { revalidatePath } from 'next/cache'
import { logger } from '@/shared/lib/logger'
import { updateUserRoleSchema, type UpdateUserRoleInput } from '../lib/validations'

type Result =
  | { success: true }
  | { success: false; error: string; errors?: Record<string, string[]> }

export async function updateUserRole(input: UpdateUserRoleInput): Promise<Result> {
  try {
    const result = updateUserRoleSchema.safeParse(input)

    if (!result.success) {
      return {
        success: false,
        error: 'Dados inválidos. Verifique os campos e tente novamente.',
        errors: result.error.flatten().fieldErrors,
      }
    }

    const { userId, newRole } = result.data

    const supabase = await createClient()
    const { id: currentUserId, tenant_id: tenantId, role } = await getUserData()
    requireAdminPermission(role)

    if (userId === currentUserId) {
      return {
        success: false,
        error: 'Você não pode alterar seu próprio nível de permissão',
      }
    }

    const { data: targetUser } = await supabase
      .from('users')
      .select('role, full_name, email')
      .eq('id', userId)
      .eq('tenant_id', tenantId)
      .single()

    if (!targetUser) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)
      .eq('tenant_id', tenantId)

    if (updateError) {
      logger.error('Failed to update user role', updateError, {
        userId,
        newRole,
        tenantId,
        currentUserId,
      })
      return {
        success: false,
        error: 'Erro ao atualizar permissão do usuário',
      }
    }

    await createActivityLog({
      action_type: 'UPDATE_USER',
      entity_type: 'user',
      entity_id: userId,
      old_value: {
        role: targetUser.role,
      },
      new_value: {
        role: newRole,
      },
      metadata: {
        user_name: targetUser.full_name,
        user_email: targetUser.email,
      },
    })

    logger.info('User role updated successfully', {
      userId,
      oldRole: targetUser.role,
      newRole,
      currentUserId,
      tenantId,
    })

    revalidatePath('/users')
    return { success: true }
  } catch (error) {
    logger.error(
      'Unexpected error updating user role',
      error instanceof Error ? error : new Error(String(error)),
    )
    return { success: false, error: 'Erro ao atualizar permissão do usuário' }
  }
}
