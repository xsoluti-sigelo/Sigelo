export { Sidebar } from './components/Sidebar'
export { Navigation } from './components/Navigation'
export { UserProfile } from './components/UserProfile'
export { ThemeToggle } from './components/ThemeToggle'

export { useSidebar } from './hooks/useSidebar'
export { useNavigation } from './hooks/useNavigation'

export type {
  SidebarProps,
  NavigationItem,
  NavigationProps,
  UserProfileProps,
  ThemeToggleProps,
  SidebarState,
  SidebarConfig,
} from './types/sidebar.types'

export { sidebarService } from './services/sidebar.service'
export { getUserPreferences, saveUserPreferences } from './actions/get-user-preferences'
export type { UserPreferences } from './actions/get-user-preferences'
export { SIDEBAR_CONSTANTS, SIDEBAR_ANIMATIONS, SIDEBAR_STYLES } from './lib/constants'
export * from './lib/utils'
