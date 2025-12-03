import { ReactNode } from 'react'

export interface FormLabelProps {
  htmlFor?: string
  children: ReactNode
  required?: boolean
  optional?: boolean
  className?: string
}

export function FormLabel({
  htmlFor,
  children,
  required,
  optional,
  className = '',
}: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${className}`}
    >
      {children}
      {required && <span className="text-current ml-1">*</span>}
      {optional && (
        <span className="text-gray-400 dark:text-gray-500 ml-1 font-normal">(Opcional)</span>
      )}
    </label>
  )
}
