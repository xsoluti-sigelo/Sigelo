'use client'

import { forwardRef } from 'react'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    const textareaClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
      error ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'
    } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${className || ''}`

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}
        <textarea ref={ref} className={textareaClasses} {...props} />
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
