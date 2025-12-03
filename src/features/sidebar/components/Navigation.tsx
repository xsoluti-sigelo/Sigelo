'use client'

import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/shared'
import { useNavigation } from '../hooks/useNavigation'
import type { NavigationProps, NavigationItem } from '../types/sidebar.types'

export function Navigation({ isCollapsed }: NavigationProps) {
  const { navigationItems, isActive, toggleExpanded, isExpanded } = useNavigation()

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isItemActive = isActive(item)
    const isItemExpanded = isExpanded(item.name)

    const hasActiveSubItem = item.subItems?.some((subItem) => isActive(subItem)) || false

    if (hasSubItems && isCollapsed) {
      return (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors justify-center',
            isItemActive || hasActiveSubItem
              ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
          )}
          title={item.name}
        >
          <item.icon className="w-5 h-5 flex-shrink-0" />
        </Link>
      )
    }

    if (hasSubItems && !isCollapsed) {
      return (
        <div key={item.name} className={cn(level === 0 && 'mb-1')}>
          <button
            onClick={() => toggleExpanded(item.name)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isItemActive || hasActiveSubItem
                ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
              level > 0 && 'ml-4',
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-left">{item.name}</span>
            <ChevronDown
              className={cn(
                'w-5 h-5 transition-transform duration-200',
                isItemExpanded && 'rotate-180',
              )}
            />
          </button>
          {isItemExpanded && item.subItems && (
            <div className="mt-1 ml-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1">
              {item.subItems.map((subItem) => renderNavigationItem(subItem, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isItemActive
            ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
          isCollapsed && 'justify-center',
          level > 0 && !isCollapsed && 'ml-2',
        )}
        title={isCollapsed ? item.name : undefined}
      >
        <item.icon className={cn('flex-shrink-0', level > 0 ? 'w-4 h-4' : 'w-5 h-5')} />
        {!isCollapsed && (
          <>
            <span className={cn(level > 0 && 'text-sm')}>{item.name}</span>
            {item.badge && (
              <span className="ml-auto bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 text-xs px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    )
  }

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {navigationItems.map((item) => renderNavigationItem(item))}
    </nav>
  )
}
