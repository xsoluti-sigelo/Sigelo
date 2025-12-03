export const SIDEBAR_CONSTANTS = {
  STORAGE_KEY: 'sidebar-collapsed',
  ANIMATION_DURATION: 300,
  COLLAPSED_WIDTH: 'w-20',
  EXPANDED_WIDTH: 'w-64',
  HOVER_DELAY: 150,
  MOBILE_BREAKPOINT: 768,
} as const

export const SIDEBAR_ANIMATIONS = {
  sidebar: 'transition-all duration-300',
  item: 'transition-colors',
  icon: 'transition-transform',
  expand: 'transition-transform duration-200',
} as const

export const SIDEBAR_STYLES = {
  base: 'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen',
  header:
    'h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700',
  navigation: 'flex-1 px-3 py-4 space-y-1 overflow-y-auto',
  footer: 'p-3 border-t border-gray-200 dark:border-gray-700 space-y-1',
  activeItem: 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400',
  inactiveItem: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
  button: 'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
} as const
