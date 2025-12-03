'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/shared/config'
import type { CalendarEvent } from '../model/types'

interface UseCalendarNavigationResult {
  navigateToOperation: (event: CalendarEvent) => void
}

export function useCalendarNavigation(): UseCalendarNavigationResult {
  const router = useRouter()

  const navigateToOperation = useCallback(
    (event: CalendarEvent) => {
      router.push(ROUTES.OPERATION_DETAILS(event.id))
    },
    [router],
  )

  return {
    navigateToOperation,
  }
}
