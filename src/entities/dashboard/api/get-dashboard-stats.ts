import { createClient } from '@/shared/lib/supabase/server'
import { getUserData } from '@/entities/user'
import { logger } from '@/shared/lib/logger'
import type { DashboardStats } from '../model/types'

const defaultStats: DashboardStats = {
  totalEvents: 0,
  totalEquipment: 0,
  totalClients: 0,
  activeEvents: 0,
  upcomingEvents: 0,
  completedEvents: 0,
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()
  const userData = await getUserData()

  if (!userData?.tenant_id) {
    throw new Error('User not authenticated')
  }

  try {
    const today = new Date().toISOString().split('T')[0]

    const { count: totalEvents } = await supabase
      .from('new_events')
      .select('*', { count: 'exact', head: true })

    const { count: activeEvents } = await supabase
      .from('new_events')
      .select('*', { count: 'exact', head: true })
      .in('status', ['ACTIVE', 'CONFIRMED', 'IN_PROGRESS', 'SCHEDULED'])

    const { count: upcomingEvents } = await supabase
      .from('new_events')
      .select('*', { count: 'exact', head: true })
      .gte('start_date', today)
      .not('status', 'in', '("COMPLETED","CANCELLED","BILLED")')

    const { count: completedEvents } = await supabase
      .from('new_events')
      .select('*', { count: 'exact', head: true })
      .in('status', ['COMPLETED', 'BILLED'])

    const { count: totalEquipment } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })

    const { count: totalClients } = await supabase
      .from('contaazul_pessoas')
      .select('*', { count: 'exact', head: true })

    return {
      totalEvents: totalEvents || 0,
      totalEquipment: totalEquipment || 0,
      totalClients: totalClients || 0,
      activeEvents: activeEvents || 0,
      upcomingEvents: upcomingEvents || 0,
      completedEvents: completedEvents || 0,
    }
  } catch (error) {
    logger.error(
      'Error fetching dashboard stats',
      error instanceof Error ? error : new Error(String(error)),
      {
        userId: userData.id,
        tenantId: userData.tenant_id,
      },
    )
    return defaultStats
  }
}
