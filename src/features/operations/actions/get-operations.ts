'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { getUserData } from '@/entities/user'

export async function getOperations() {
  const supabase = await createClient()

  const userData = await getUserData()
  if (!userData?.tenant_id) {
    return { success: false, error: 'Unauthorized', operations: [] }
  }

  try {
    const { data: operations, error } = await supabase
      .from('new_operations')
      .select(
        `
        *,
        new_events:event_id (
          id,
          number,
          name,
          date,
          start_time,
          end_time
        )
      `,
      )
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (error) {
      return {
        success: false,
        error: 'Failed to fetch operations',
        operations: [],
      }
    }

    return { success: true, operations: operations || [] }
  } catch {
    return {
      success: false,
      error: 'Error fetching operations',
      operations: [],
    }
  }
}
