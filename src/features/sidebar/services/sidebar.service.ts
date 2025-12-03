import { ROUTES } from '@/shared/config'
import { NavigationItem } from '../types/sidebar.types'
import {
  Ticket,
  CalendarRange,
  CircleUser,
  ClipboardList,
  LayoutDashboard,
  MapPinned,
  Plug,
  Settings,
  Wrench,
  Truck,
  Users,
  UsersRound,
} from 'lucide-react'

const SIDEBAR_STORAGE_KEY = 'sidebar-collapsed'

export const sidebarService = {
  getNavigationItems(): NavigationItem[] {
    return [
      {
        name: 'Dashboard',
        href: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
      },
      {
        name: 'Funcionários',
        href: ROUTES.EMPLOYEES,
        icon: Users,
      },
      {
        name: 'Veículos',
        href: ROUTES.VEHICLES,
        icon: Truck,
      },
      {
        name: 'Eventos',
        href: ROUTES.EVENTS,
        icon: Ticket,
      },
      {
        name: 'Operações',
        href: ROUTES.OPERATIONS,
        icon: MapPinned,
      },
      {
        name: 'Calendário',
        href: ROUTES.CALENDAR,
        icon: CalendarRange,
      },
      {
        name: 'Integrações',
        href: ROUTES.INTEGRATIONS,
        icon: Plug,
        subItems: [
          {
            name: 'Conexão',
            href: ROUTES.INTEGRATIONS,
            icon: Settings,
          },
          {
            name: 'Clientes',
            href: ROUTES.INTEGRATIONS_CLIENTS,
            icon: UsersRound,
          },
          {
            name: 'Serviços',
            href: ROUTES.INTEGRATIONS_SERVICES,
            icon: Wrench,
          },
        ],
      },
      {
        name: 'Usuários',
        href: ROUTES.USERS,
        icon: CircleUser,
        adminOnly: true,
      },
      {
        name: 'Auditoria',
        href: ROUTES.AUDIT,
        icon: ClipboardList,
        adminOnly: true,
      },
    ]
  },

  getCollapsedState(): boolean {
    if (typeof window === 'undefined') return false
    const savedState = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    return savedState === 'true'
  },

  saveCollapsedState(collapsed: boolean): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed))
  },

  isNavigationItemActive(item: NavigationItem, pathname: string): boolean {
    if (item.href === pathname) return true

    if (item.subItems && item.subItems.length > 0) {
      return false
    }

    if (pathname.startsWith(item.href + '/')) return true

    return false
  },

  filterNavigationByRole(items: NavigationItem[], isAdmin: boolean): NavigationItem[] {
    return items
      .filter((item) => !item.adminOnly || isAdmin)
      .map((item) => {
        if (item.subItems) {
          return {
            ...item,
            subItems: this.filterNavigationByRole(item.subItems, isAdmin),
          }
        }
        return item
      })
  },

  getConfig() {
    return {
      defaultCollapsed: false,
      storageKey: SIDEBAR_STORAGE_KEY,
      animationDuration: 300,
      collapsedWidth: 'w-20',
      expandedWidth: 'w-64',
    }
  },
}
