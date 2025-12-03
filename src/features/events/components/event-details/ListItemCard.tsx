import React from 'react'

interface ListItemCardProps {
  title: React.ReactNode
  badge?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function ListItemCard({ title, badge, children, className = '' }: ListItemCardProps) {
  return (
    <div
      className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        {badge}
      </div>
      {children}
    </div>
  )
}
