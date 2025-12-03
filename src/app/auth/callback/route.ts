import { createClient } from '@/shared/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createActivityLog } from '@/features/logs'
import { logger } from '@/shared/lib/logger'
import { ROUTES } from '@/shared/config'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? ROUTES.DASHBOARD

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      try {
        await createActivityLog({
          action_type: 'LOGIN',
        })
      } catch (logError) {
        logger.error('Failed to log login', logError as Error)
      }

      const cookieStore = await cookies()
      const inviteToken = cookieStore.get('invite_token')?.value

      if (inviteToken) {
        return NextResponse.redirect(`${origin}/api/auth/finalize-invite?token=${inviteToken}`)
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user?.user_metadata?.invite_token) {
        return NextResponse.redirect(
          `${origin}/api/auth/finalize-invite?token=${user.user_metadata.invite_token}`,
        )
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}${ROUTES.AUTH_ERROR}`)
}
