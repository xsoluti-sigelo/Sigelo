'use client'

import Lottie from 'lottie-react'
import dotLoadingAnimation from '@/assets/DotLoading.json'
import { cn } from '@/shared'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'

  text?: string

  fullscreen?: boolean

  className?: string
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
}

export function Loading({ size = 'md', text, fullscreen = false, className }: LoadingProps) {
  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={sizeClasses[size]}>
        <Lottie animationData={dotLoadingAnimation} loop={true} autoplay={true} />
      </div>
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium animate-pulse">{text}</p>
      )}
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return content
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('w-5 h-5', className)}>
      <Lottie animationData={dotLoadingAnimation} loop={true} autoplay={true} />
    </div>
  )
}

export function LoadingOverlay({ text }: { text?: string }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg">
      <Loading size="lg" text={text} />
    </div>
  )
}
