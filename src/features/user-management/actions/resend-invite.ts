'use server'

import { getUserData, requireAdminPermission } from '@/entities/user'
import { randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'
import { createActivityLog } from '@/features/logs'
import { logger } from '@/shared/lib/logger'
import { inviteActionSchema, type InviteActionInput } from '../lib/validations'
import { ROUTES } from '@/shared/config'

type Result =
  | { success: true }
  | { success: false; error: string; errors?: Record<string, string[]> }

export async function resendInvite(input: InviteActionInput): Promise<Result> {
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

    const inviteToken = randomBytes(32).toString('hex')

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const { createAdminClient } = await import('@/shared/lib/supabase/admin')
    const adminClient = createAdminClient()

    const { data: invite, error } = await adminClient
      .from('user_invites')
      .update({
        invite_token: inviteToken,
        expires_at: expiresAt.toISOString(),
        status: 'PENDING',
      })
      .eq('id', inviteId)
      .eq('tenant_id', tenantId)
      .in('status', ['PENDING', 'EXPIRED'])
      .select()
      .single()

    if (error) {
      logger.error('Failed to resend invite', error, {
        inviteId,
        tenantId,
        userId,
      })
      return { success: false, error: 'Erro ao reenviar convite' }
    }

    logger.info('Invite token renewed - new link can be copied from invites table', {
      inviteId,
      email: invite.email,
    })

    await createActivityLog({
      action_type: 'UPDATE_USER',
      entity_type: 'user',
      entity_id: inviteId,
      metadata: {
        action: 'resend_invite',
      },
    })

    logger.info('Invite resent successfully', {
      inviteId,
      email: invite.email,
      userId,
      tenantId,
    })

    revalidatePath(ROUTES.USERS_INVITES)
    revalidatePath(ROUTES.USERS)

    return { success: true }
  } catch (error) {
    logger.error(
      'Unexpected error resending invite',
      error instanceof Error ? error : new Error(String(error)),
    )
    return { success: false, error: 'Erro ao reenviar convite' }
  }
}
