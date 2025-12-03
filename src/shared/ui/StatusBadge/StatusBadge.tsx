interface StatusBadgeProps {
  label: string
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'purple' | 'teal'
  icon?: React.ReactNode
  className?: string
}

export function StatusBadge({
  label,
  variant = 'neutral',
  icon,
  className = '',
}: StatusBadgeProps) {
  const variants = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
    neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
    teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {icon}
      {label}
    </span>
  )
}
