import type { DashboardStatsCard } from '../types'
import { iconMap, colorMap } from '../lib'

interface StatsCardProps {
  card: DashboardStatsCard
}

export function StatsCard({ card }: StatsCardProps) {
  const icon = iconMap[card.icon as keyof typeof iconMap]
  const colors = colorMap[card.color as keyof typeof colorMap]

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</h3>
        <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
          <svg
            className={`w-5 h-5 ${colors.icon}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {icon}
          </svg>
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {card.value.toLocaleString()}
      </p>
      {card.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.description}</p>
      )}
    </div>
  )
}
