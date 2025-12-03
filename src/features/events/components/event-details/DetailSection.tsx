import React from 'react'
import { Card } from '@/shared/ui'

interface DetailSectionProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function DetailSection({ title, children, className = '' }: DetailSectionProps) {
  return (
    <Card className={`p-6 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-200 dark:border-gray-700 mb-6">
        {title}
      </h2>
      {children}
    </Card>
  )
}
