'use server'

import { getUserData, requireAdminPermission } from '@/entities/user'
import { revalidatePath } from 'next/cache'
import { createActivityLog } from '@/features/logs'
import { logger } from '@/shared/lib/logger'
import { inviteActionSchema, type InviteActionInput } from '../lib/validations'
import { ROUTES } from '@/shared/config'

type Result =
  | { success: true }
  | { success: false; error: string; errors?: Record<string, string[]> }

export async function cancelInvite(input: InviteActionInput): Promise<Result> {
  try {
    const result = inviteActionSchema.safeParse(input)

    if (!result.success) {
      return {
        success: false,
        error: 'ID de convite inválido.',
        errors: result.error.flatten().fieldErrors,
      }
    }

    const { inviteId } = result.data

    const { id: userId, tenant_id: tenantId, role } = await getUserData()
    requireAdminPermission(role)

    const { createAdminClient } = await import('@/shared/lib/supabase/admin')
    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('user_invites')
      .update({
        status: 'CANCELLED',
        cancelled_at: new Date().toISOString(),
        cancelled_by: userId,
      } as never)
      .eq('id', inviteId)
      .eq('tenant_id', tenantId)
      .eq('status', 'PENDING' as never)

    if (error) {
      logger.error('Failed to cancel invite', error, {
        inviteId,
        tenantId,
        userId,
      })
      return { success: false, error: 'Erro ao cancelar convite' }
    }

    await createActivityLog({
      action_type: 'DELETE_USER',
      entity_type: 'user',
      entity_id: inviteId,
      metadata: {
        action: 'cancel_invite',
      },
    })

    logger.info('Invite cancelled successfully', {
      inviteId,
      userId,
      tenantId,
    })

    revalidatePath(ROUTES.USERS_INVITES)
    revalidatePath(ROUTES.USERS)

    return { success: true }
  } catch (error) {
    logger.error(
      'Unexpected error cancelling invite',
      error instanceof Error ? error : new Error(String(error)),
    )
    return { success: false, error: 'Erro ao cancelar convite' }
  }
}
