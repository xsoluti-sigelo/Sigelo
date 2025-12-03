import { Tab } from '@/shared/ui'
import { ReactNode } from 'react'

export interface TabComponentProps {
  content: ReactNode
}

export type EventDetailsTab = Tab

export interface TabConfig {
  id: string
  label: string
  badge?: number
  content: ReactNode
}
