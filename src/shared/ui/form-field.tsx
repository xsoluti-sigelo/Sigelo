import { ReactNode } from 'react'
import { FormLabel } from './form-label'

export interface FormFieldProps {
  label: string
  htmlFor?: string
  required?: boolean
  optional?: boolean
  error?: string
  helperText?: string
  children: ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  required,
  optional,
  error,
  helperText,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={className}>
      <FormLabel htmlFor={htmlFor} required={required} optional={optional}>
        {label}
      </FormLabel>
      {children}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
