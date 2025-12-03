import { NextResponse } from 'next/server'
import { createClient } from '@/shared/lib/supabase/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { logger } from '@/shared/lib/logger'
import { ROUTES } from '@/shared/config'
interface ExistingUserRow {
  id: string
  tenant_id: string | null
}

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const inviteToken = searchParams.get('token')

    logger.info('Finalize invite started', {
      hasToken: !!inviteToken,
      origin,
    })

    if (!inviteToken) {
      logger.warn('No invite token provided')
      return NextResponse.redirect(new URL(ROUTES.AUTH_ERROR, request.url))
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    logger.info('User authentication status', {
      isAuthenticated: !!user,
      userEmail: user?.email,
    })

    if (!user) {
      const response = NextResponse.redirect(new URL(ROUTES.LOGIN, request.url))
      response.cookies.set('invite_token', inviteToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 60 * 60,
        path: '/',
      })
      return response
    }

    const adminClient = createAdminClient()

    const { data: invite, error: inviteError } = await adminClient
      .from('user_invites')
      .select('id, email, full_name, role, tenant_id, status, expires_at')
      .eq('invite_token', inviteToken)
      .single()

    if (inviteError || !invite) {
      logger.warn('Invite not found', {
        inviteError,
        inviteToken: inviteToken.substring(0, 8) + '...',
      })
      const res_nf = NextResponse.redirect(
        new URL(`${ROUTES.AUTH_ERROR}?reason=invite_not_found`, request.url),
      )
      res_nf.cookies.delete('invite_token')
      return res_nf
    }

    if (invite.status === 'CANCELLED') {
      logger.warn('Invite is cancelled', { inviteId: invite.id })
      const res_cancel = NextResponse.redirect(
        new URL(`${ROUTES.AUTH_ERROR}?reason=invite_cancelled`, request.url),
      )
      res_cancel.cookies.delete('invite_token')
      return res_cancel
    }

    const expiresAt = invite.expires_at ? new Date(invite.expires_at) : null
    if (expiresAt && expiresAt < new Date()) {
      await adminClient
        .from('user_invites')
        .update({
          status: 'EXPIRED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', invite.id)
        .eq('status', 'PENDING')
      logger.warn('Invite expired', { inviteId: invite.id })
      const res_exp = NextResponse.redirect(
        new URL(`${ROUTES.AUTH_ERROR}?reason=invite_expired`, request.url),
      )
      res_exp.cookies.delete('invite_token')
      return res_exp
    }
    if (invite.status === 'ACCEPTED') {
      logger.info('Invite already accepted', { inviteId: invite.id })
      const res_acc = NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url))
      res_acc.cookies.delete('invite_token')
      return res_acc
    }

    if (invite.email !== user.email) {
      logger.warn('Email mismatch', {
        inviteEmail: invite.email,
        userEmail: user.email,
      })
      const res_em = NextResponse.redirect(
        new URL(`${ROUTES.AUTH_ERROR}?reason=email_mismatch`, request.url),
      )
      res_em.cookies.delete('invite_token')
      return res_em
    }

    logger.info('Finalizing invite', {
      email: user.email,
      inviteId: invite.id,
    })

    const { data: existingUser } = await adminClient
      .from('users')
      .select('id, tenant_id')
      .eq('google_id', user.id)
      .single<ExistingUserRow>()

    if (existingUser && existingUser.tenant_id && existingUser.tenant_id !== invite.tenant_id) {
      logger.warn('Tenant conflict on invite finalize', {
        inviteId: invite.id,
        existingTenantId: existingUser.tenant_id,
        inviteTenantId: invite.tenant_id,
      })
      const res_tc = NextResponse.redirect(
        new URL(`${ROUTES.AUTH_ERROR}?reason=tenant_conflict`, request.url),
      )
      res_tc.cookies.delete('invite_token')
      return res_tc
    }

    if (!existingUser) {
      const { error: insertError } = await adminClient.from('users').insert({
        google_id: user.id,
        email: user.email!,
        full_name: invite.full_name || user.user_metadata?.full_name || user.email!.split('@')[0],
        role: invite.role,
        tenant_id: invite.tenant_id,
        active: true,
        picture_url: user.user_metadata?.picture || user.user_metadata?.avatar_url,
        last_login_at: new Date().toISOString(),
      })

      if (insertError && insertError.code !== '23505') {
        logger.error('Failed to create user in finalize', insertError, {
          email: user.email,
          inviteId: invite.id,
        })
        return NextResponse.redirect(
          new URL(`${ROUTES.AUTH_ERROR}?reason=user_creation`, request.url),
        )
      }
    }

    await adminClient
      .from('user_invites')
      .update({
        accepted_at: new Date().toISOString(),
        status: 'ACCEPTED',
      })
      .eq('id', invite.id)

    logger.info('Invite finalized successfully', {
      email: user.email,
      inviteId: invite.id,
    })

    const res_ok = NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url))
    res_ok.cookies.delete('invite_token')
    return res_ok
  } catch (error) {
    logger.error('Error finalizing invite', error as Error)
    return NextResponse.redirect(new URL(ROUTES.AUTH_ERROR, request.url))
  }
}
