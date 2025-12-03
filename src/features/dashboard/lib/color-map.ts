import type { ColorConfig, ColorType } from '../types'

export const colorMap: Record<ColorType, ColorConfig> = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    icon: 'text-green-600 dark:text-green-400',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    icon: 'text-purple-600 dark:text-purple-400',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    icon: 'text-orange-600 dark:text-orange-400',
  },
  indigo: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/20',
    icon: 'text-indigo-600 dark:text-indigo-400',
  },
  emerald: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
}
