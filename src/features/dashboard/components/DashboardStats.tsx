import { StatsCard } from './StatsCard'
import type { DashboardStatsCard } from '../types'

interface DashboardStatsProps {
  cards: DashboardStatsCard[]
}

export function DashboardStats({ cards }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => (
        <StatsCard key={`${card.title}-${index}`} card={card} />
      ))}
    </div>
  )
}
