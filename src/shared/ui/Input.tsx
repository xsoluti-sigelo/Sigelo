import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/shared'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border rounded-lg text-sm',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'dark:bg-gray-800 dark:border-gray-600 dark:text-white',
            error ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600',
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
