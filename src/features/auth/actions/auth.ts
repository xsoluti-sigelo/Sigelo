'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createActivityLog } from '@/features/logs'
import { logger } from '@/shared/lib/logger'
import { ROUTES } from '@/shared/config'

export async function signOut() {
  const supabase = await createClient()

  try {
    await createActivityLog({
      action_type: 'LOGOUT',
    })
  } catch (error) {
    logger.error('Failed to log logout', error as Error)
  }

  await supabase.auth.signOut()
  redirect(ROUTES.LOGIN)
}

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}
