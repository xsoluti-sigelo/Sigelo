import React from 'react'

interface FieldDisplayProps {
  label: string
  value: React.ReactNode
  className?: string
}

export function FieldDisplay({ label, value, className = '' }: FieldDisplayProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </label>
      <div className="text-base text-gray-900 dark:text-gray-100">{value}</div>
    </div>
  )
}
