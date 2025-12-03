'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Loading } from './Loading'

export function PageTransition() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    setIsNavigating(true)

    const timer = setTimeout(() => {
      setIsNavigating(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  if (!isNavigating) return null

  return <Loading fullscreen size="lg" />
}
