import { createBrowserClient } from '@supabase/ssr'
import type { Session } from '@supabase/supabase-js'
import { Database } from './types'
import { logger } from '@/shared/lib/logger'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export async function signInWithGoogle() {
  const supabase = createClient()

  const isProduction = process.env.NODE_ENV === 'production'
  const redirectUrl = isProduction
    ? 'https://sigelo.vercel.app/auth/callback'
    : `${window.location.origin}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: false,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    logger.error('Error signing in with Google', error)
    throw error
  }

  return data
}

export async function signOut() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    logger.error('Error signing out', error)
    throw error
  }
}

export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  const supabase = createClient()

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback)

  return () => subscription.unsubscribe()
}
