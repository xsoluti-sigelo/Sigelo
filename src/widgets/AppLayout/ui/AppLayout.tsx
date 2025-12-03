'use client'

import { ReactNode } from 'react'

interface AppLayoutProps {
  sidebar: ReactNode
  children: ReactNode
}

export function AppLayout({ sidebar, children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {sidebar}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
    </div>
  )
}
