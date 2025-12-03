import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './types'
import { logger } from '@/shared/lib/logger'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {}
        },
      },
    },
  )
}

export async function getSession() {
  const supabase = await createClient()
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    logger.error('Error fetching session', error)
    return null
  }

  return session
}

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    logger.error('Error fetching user', error)
    return null
  }

  return user
}

export async function requireAuth() {
  const user = await getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}
