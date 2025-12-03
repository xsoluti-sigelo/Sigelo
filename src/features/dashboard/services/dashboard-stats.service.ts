import { getDashboardStats as fetchDashboardStats } from '@/entities/dashboard'
import type { DashboardStats } from '@/entities/dashboard'
import type { DashboardStatsCard } from '../types'

export class DashboardStatsService {
  async getDashboardStats(): Promise<DashboardStats> {
    return fetchDashboardStats()
  }

  getDashboardCards(stats: DashboardStats): DashboardStatsCard[] {
    return [
      {
        title: 'Total de Eventos',
        value: stats.totalEvents,
        icon: 'calendar',
        color: 'blue',
        description: `${stats.activeEvents} ativos`,
      },
      {
        title: 'Equipamentos',
        value: stats.totalEquipment,
        icon: 'equipment',
        color: 'green',
        description: 'Tipos cadastrados',
      },
      {
        title: 'Clientes',
        value: stats.totalClients,
        icon: 'clients',
        color: 'purple',
        description: 'Organizações',
      },
      {
        title: 'Eventos Ativos',
        value: stats.activeEvents,
        icon: 'activity',
        color: 'orange',
        description: 'Em andamento',
      },
      {
        title: 'Próximos Eventos',
        value: stats.upcomingEvents,
        icon: 'clock',
        color: 'indigo',
        description: 'Agendados',
      },
      {
        title: 'Eventos Concluídos',
        value: stats.completedEvents,
        icon: 'check',
        color: 'emerald',
        description: 'Finalizados',
      },
    ]
  }
}

export const dashboardStatsService = new DashboardStatsService()
