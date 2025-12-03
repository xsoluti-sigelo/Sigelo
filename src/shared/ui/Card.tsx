import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/shared'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      outlined: 'border-2 border-gray-300 dark:border-gray-600',
      elevated: 'bg-white dark:bg-gray-800 shadow-lg',
    }

    return (
      <div ref={ref} className={cn('rounded-xl p-6', variants[variant], className)} {...props}>
        {children}
      </div>
    )
  },
)

Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('mb-4', className)} {...props} />,
)

CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-semibold text-gray-900 dark:text-white', className)}
      {...props}
    />
  ),
)

CardTitle.displayName = 'CardTitle'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('', className)} {...props} />,
)

CardContent.displayName = 'CardContent'
