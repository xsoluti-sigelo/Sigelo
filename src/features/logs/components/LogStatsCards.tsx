'use client'

import type { ActivityLog } from '../types'
import { useLogStats } from '../hooks'
import { Card } from '@/shared/ui'

interface LogStatsCardsProps {
  logs: ActivityLog[]
}

export function LogStatsCards({ logs }: LogStatsCardsProps) {
  const { stats, errorRate, mostActiveDay } = useLogStats(logs)

  const cards = [
    {
      label: 'Total de Logs',
      value: stats.totalLogs.toLocaleString('pt-BR'),
      color: 'blue',
    },
    {
      label: 'Taxa de Sucesso',
      value: `${stats.successRate.toFixed(1)}%`,
      color: 'green',
    },
    {
      label: 'Taxa de Erro',
      value: `${errorRate.toFixed(1)}%`,
      color: 'red',
    },
    {
      label: 'Dia Mais Ativo',
      value: mostActiveDay?.date || '-',
      subtitle: mostActiveDay ? `${mostActiveDay.count} ações` : undefined,
      color: 'purple',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-5">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {card.label}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
            {card.subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.subtitle}</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
