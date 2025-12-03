'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { getUserData, requireAdminPermission } from '@/entities/user'
import { randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'
import { createActivityLog } from '@/features/logs'
import { logger } from '@/shared/lib/logger'
import { createInviteSchema, type CreateInviteInput } from '../lib/validations'
import { ROUTES } from '@/shared/config'

type Result =
  | { success: true; inviteId: string }
  | { success: false; error: string; errors?: Record<string, string[]> }

export async function createInvite(input: CreateInviteInput): Promise<Result> {
  try {
    const result = createInviteSchema.safeParse(input)

    if (!result.success) {
      return {
        success: false,
        error: 'Dados inválidos. Verifique os campos e tente novamente.',
        errors: result.error.flatten().fieldErrors,
      }
    }

    const data = result.data

    const supabase = await createClient()
    const { id: userId, tenant_id: tenantId, role } = await getUserData()
    requireAdminPermission(role)

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email)
      .eq('tenant_id', tenantId)
      .maybeSingle()

    if (existingUser) {
      return {
        success: false,
        error: 'Este email já está cadastrado como usuário',
      }
    }

    const { data: existingInvite } = await supabase
      .from('user_invites')
      .select('id, status')
      .eq('email', data.email)
      .eq('tenant_id', tenantId)
      .eq('status', 'PENDING')
      .maybeSingle()

    if (existingInvite) {
      return {
        success: false,
        error: 'Já existe um convite pendente para este email',
      }
    }

    const inviteToken = randomBytes(32).toString('hex')

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const { createAdminClient } = await import('@/shared/lib/supabase/admin')
    const adminClient = createAdminClient()

    const { data: invite, error } = await adminClient
      .from('user_invites')
      .insert({
        tenant_id: tenantId,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        invited_by: userId,
        invite_token: inviteToken,
        expires_at: expiresAt.toISOString(),
        status: 'PENDING',
      } as never)
      .select()
      .single()

    if (error) {
      logger.error('Failed to create invite', error, {
        email: data.email,
        role: data.role,
        tenantId,
        userId,
        errorCode: error.code,
        errorDetails: error.details,
      })

      if (
        error.code === '23505' ||
        error.message?.includes('duplicate') ||
        error.message?.includes('unique')
      ) {
        return {
          success: false,
          error: 'Já existe um convite pendente para este email.',
        }
      }

      return { success: false, error: 'Erro ao criar convite' }
    }

    const { inviteUserByEmail } = await import('@/shared/lib/supabase/admin')
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/accept-invite?token=${inviteToken}`

    const emailResult = await inviteUserByEmail(data.email, {
      redirectTo: inviteUrl,
      data: {
        invite_token: inviteToken,
        tenant_id: tenantId,
        role: data.role,
        full_name: data.full_name,
      },
    })

    if (!emailResult.success) {
      logger.warn('Invite created but email failed to send', {
        inviteId: invite.id,
        email: data.email,
        emailError: emailResult.error,
      })
    } else {
      logger.info('Invite email sent successfully', {
        inviteId: invite.id,
        email: data.email,
      })
    }

    await createActivityLog({
      action_type: 'CREATE_USER',
      entity_type: 'user',
      entity_id: invite.id,
      new_value: {
        email: data.email,
        full_name: data.full_name,
        role: data.role,
      },
    })

    logger.info('User invite created successfully', {
      inviteId: invite.id,
      email: data.email,
      role: data.role,
      userId,
      tenantId,
    })

    revalidatePath(ROUTES.USERS_INVITES)

    return { success: true, inviteId: invite.id }
  } catch (error) {
    logger.error(
      'Unexpected error creating invite',
      error instanceof Error ? error : new Error(String(error)),
    )
    return { success: false, error: 'Erro ao criar convite' }
  }
}
