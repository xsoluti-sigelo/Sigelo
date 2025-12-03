import { z } from 'zod'

export const dashboardStatsCardSchema = z.object({
  title: z.string(),
  value: z.number(),
  icon: z.enum(['calendar', 'equipment', 'clients', 'activity', 'clock', 'check']),
  color: z.enum(['blue', 'green', 'purple', 'orange', 'indigo', 'emerald']),
  description: z.string().optional(),
})

export const dashboardStatsSchema = z.object({
  totalEvents: z.number(),
  activeEvents: z.number(),
  upcomingEvents: z.number(),
  completedEvents: z.number(),
  totalEquipment: z.number(),
  totalClients: z.number(),
})
