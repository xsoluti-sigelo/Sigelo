import { Button } from '@/shared/ui'
import type { ComponentType, ReactNode } from 'react'

interface ActionButtonProps {
  icon: ComponentType<{ className?: string }>
  label: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  title?: string
  type?: 'button' | 'submit' | 'reset'
  animateIcon?: boolean
}

export function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  variant,
  size,
  className,
  title,
  type = 'button',
  animateIcon = false,
}: ActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      size={size}
      className={className}
      title={title}
      type={type}
    >
      <Icon className={`w-5 h-5 mr-2 ${animateIcon ? 'animate-spin' : ''}`} />
      {label}
    </Button>
  )
}
