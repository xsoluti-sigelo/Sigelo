'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/entities/user'
import { sidebarService } from '../services/sidebar.service'
import { NavigationItem } from '../types/sidebar.types'

export function useNavigation() {
  const pathname = usePathname()
  const { isAdmin } = useUser()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const navigationItems = useMemo(() => {
    const allItems = sidebarService.getNavigationItems()
    return sidebarService.filterNavigationByRole(allItems, isAdmin)
  }, [isAdmin])

  const isActive = (item: NavigationItem): boolean => {
    return sidebarService.isNavigationItemActive(item, pathname)
  }

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName) ? prev.filter((name) => name !== itemName) : [...prev, itemName],
    )
  }

  const isExpanded = (itemName: string): boolean => {
    return expandedItems.includes(itemName)
  }

  useEffect(() => {
    const newExpandedItems: string[] = []

    navigationItems.forEach((item) => {
      if (item.subItems) {
        const hasActiveChild = item.subItems.some((subItem) =>
          sidebarService.isNavigationItemActive(subItem, pathname),
        )
        if (hasActiveChild) {
          newExpandedItems.push(item.name)
        }
      }
    })

    setExpandedItems(newExpandedItems)
  }, [pathname, navigationItems])

  return {
    navigationItems,
    isActive,
    toggleExpanded,
    isExpanded,
    pathname,
  }
}
