import { createClient } from '@supabase/supabase-js'
import { logger } from '@/shared/lib/logger'
import type { Database } from './types'

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables for admin client')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function inviteUserByEmail(
  email: string,
  options?: {
    redirectTo?: string
    data?: Record<string, unknown>
  },
) {
  try {
    const admin = createAdminClient()

    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: options?.redirectTo || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      data: options?.data,
    })

    if (error) {
      logger.error('Failed to send invite email via Supabase', error, {
        email,
        redirectTo: options?.redirectTo,
      })
      return { success: false as const, error: error.message }
    }

    logger.info('Invite email sent successfully via Supabase', {
      userId: data.user.id,
      email,
    })

    return { success: true as const, user: data.user }
  } catch (error) {
    logger.error('Unexpected error sending invite email', error as Error, {
      email,
    })
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Failed to send invite',
    }
  }
}
