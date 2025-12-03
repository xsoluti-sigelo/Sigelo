import { NavigationItem } from '../types/sidebar.types'

export function getBreadcrumbPath(items: NavigationItem[], pathname: string): NavigationItem[] {
  const path: NavigationItem[] = []

  function findPath(items: NavigationItem[], currentPath: NavigationItem[]): boolean {
    for (const item of items) {
      const newPath = [...currentPath, item]

      if (item.href === pathname || pathname.startsWith(item.href + '/')) {
        path.push(...newPath)
        return true
      }

      if (item.subItems && findPath(item.subItems, newPath)) {
        return true
      }
    }
    return false
  }

  findPath(items, [])
  return path
}

export function countNavigationItems(items: NavigationItem[]): number {
  return items.reduce((count, item) => {
    const subItemsCount = item.subItems ? countNavigationItems(item.subItems) : 0
    return count + 1 + subItemsCount
  }, 0)
}

export function findNavigationItem(items: NavigationItem[], href: string): NavigationItem | null {
  for (const item of items) {
    if (item.href === href) {
      return item
    }
    if (item.subItems) {
      const found = findNavigationItem(item.subItems, href)
      if (found) return found
    }
  }
  return null
}

export function getExpandedParents(items: NavigationItem[], pathname: string): string[] {
  const expanded: string[] = []

  items.forEach((item) => {
    if (item.subItems) {
      const hasActiveChild = item.subItems.some(
        (subItem) => subItem.href === pathname || pathname.startsWith(subItem.href + '/'),
      )
      if (hasActiveChild) {
        expanded.push(item.name)
      }
    }
  })

  return expanded
}

export function shouldAutoCollapse(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

export function formatNavigationLabel(item: NavigationItem, isCollapsed: boolean): string {
  if (isCollapsed) return ''
  if (item.badge) {
    return `${item.name} (${item.badge})`
  }
  return item.name
}
