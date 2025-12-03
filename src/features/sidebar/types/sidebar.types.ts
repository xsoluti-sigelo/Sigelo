import type { LucideIcon } from 'lucide-react'
import { User } from '@/entities/user'

export interface SidebarProps {
  user: User
}

export interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
  adminOnly?: boolean
  badge?: string | number
  subItems?: NavigationItem[]
}

export interface NavigationProps {
  isCollapsed: boolean
}

export interface UserProfileProps {
  user: User
  isCollapsed: boolean
  onSignOut?: () => void
}

export interface ThemeToggleProps {
  isCollapsed: boolean
}

export interface SidebarState {
  isCollapsed: boolean
  isHovered: boolean
  expandedItems: string[]
}

export interface SidebarConfig {
  defaultCollapsed: boolean
  storageKey: string
  animationDuration: number
  collapsedWidth: string
  expandedWidth: string
}
