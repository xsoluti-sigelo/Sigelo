import { ReactNode } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { cn } from '@/shared'

interface SectionCardProps {
  title: string
  description?: string
  optionalLabel?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  isCollapsed?: boolean
  onToggle?: () => void
}

export function SectionCard({
  title,
  description,
  optionalLabel,
  actions,
  children,
  className,
  isCollapsed = false,
  onToggle,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        'border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{title}</h2>
            {optionalLabel && (
              <span className="text-xs font-medium text-slate-400 dark:text-gray-500">
                {optionalLabel}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-slate-500 dark:text-gray-400">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={!isCollapsed}
              className="rounded-full border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ChevronDownIcon
                className={cn(
                  'h-5 w-5 transition-transform duration-200',
                  isCollapsed ? '-rotate-90' : 'rotate-0',
                )}
              />
            </button>
          )}
        </div>
      </div>
      <div className={cn('px-6 py-5', isCollapsed && 'hidden')}>{children}</div>
    </div>
  )
}
