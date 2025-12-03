export interface DashboardStatsCard {
  title: string
  value: number
  icon: IconType
  color: ColorType
  description?: string
}

export type IconType = 'calendar' | 'equipment' | 'clients' | 'activity' | 'clock' | 'check'

export type ColorType = 'blue' | 'green' | 'purple' | 'orange' | 'indigo' | 'emerald'

export interface IconConfig {
  [key: string]: React.ReactNode
}

export interface ColorConfig {
  bg: string
  icon: string
}
