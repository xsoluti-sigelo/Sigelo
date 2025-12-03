'use client'

import { ReactNode, useState } from 'react'
import { cn } from '@/shared'

export interface Tab {
  id: string
  label: string
  content: ReactNode
  badge?: number
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
}

export function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content

  return (
    <div>
      {}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
              )}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={cn(
                    'ml-2 rounded-full px-2 py-0.5 text-xs font-semibold',
                    activeTab === tab.id
                      ? 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {}
      <div className="py-6">{activeTabContent}</div>
    </div>
  )
}
