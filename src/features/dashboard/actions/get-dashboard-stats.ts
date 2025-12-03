'use server'

import { getDashboardStats as fetchDashboardStats } from '@/entities/dashboard'
import type { DashboardStats } from '@/entities/dashboard'

export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchDashboardStats()
}
