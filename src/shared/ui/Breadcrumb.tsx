'use client'

import Link from 'next/link'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import { cn } from '@/shared'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center space-x-2 text-sm', className)}>
      <Link
        href="/dashboard"
        className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        <HomeIcon className="w-4 h-4" />
        <span className="sr-only">Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRightIcon className="w-4 h-4 text-gray-400 dark:text-gray-600" />

            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  isLast
                    ? 'font-medium text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 dark:text-gray-400',
                )}
              >
                {item.label}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
