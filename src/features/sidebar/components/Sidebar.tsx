'use client'

import Image from 'next/image'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/shared'
import { signOut } from '@/features/auth'
import { useSidebar } from '../hooks/useSidebar'
import { Navigation } from './Navigation'
import { UserProfile } from './UserProfile'
import { ThemeToggle } from './ThemeToggle'
import type { SidebarProps } from '../types/sidebar.types'

export function Sidebar({ user }: SidebarProps) {
  const { isCollapsed, toggleSidebar, isLoading } = useSidebar()

  const handleSignOut = async () => {
    await signOut()
  }

  if (isLoading) {
    return (
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen flex-shrink-0">
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      </aside>
    )
  }

  return (
    <aside
      className={cn(
        'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen flex-shrink-0 transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64',
      )}
    >
      {isCollapsed ? (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="h-12 flex items-center justify-center px-2">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Expandir sidebar"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 rotate-180" />
            </button>
          </div>
          <div className="h-16 flex items-center justify-center px-2 pb-2">
            <Image
              src="/assets/institutional/logo-small.png"
              alt="S"
              width={40}
              height={40}
              className="h-10 w-10"
              priority
            />
          </div>
        </div>
      ) : (
        <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200 dark:border-gray-700 relative">
          <Image
            src="/assets/institutional/logo-large.png"
            alt="Sigelo"
            width={120}
            height={40}
            className="h-10 w-auto"
            priority
          />
          <button
            onClick={toggleSidebar}
            className="absolute right-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Colapsar sidebar"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      )}

      <Navigation isCollapsed={isCollapsed} />

      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <ThemeToggle isCollapsed={isCollapsed} />
      </div>

      <UserProfile user={user} isCollapsed={isCollapsed} onSignOut={handleSignOut} />
    </aside>
  )
}
