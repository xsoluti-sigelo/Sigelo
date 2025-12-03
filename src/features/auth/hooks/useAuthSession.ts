'use client'

import { useState, useEffect, useCallback } from 'react'
import { authSessionService } from '../services'
import type { Session } from '@supabase/supabase-js'

interface UseAuthSessionReturn {
  session: Session | null
  isValid: boolean
  expiresIn: number | null
  loading: boolean
  refresh: () => Promise<void>
}

export function useAuthSession(): UseAuthSessionReturn {
  const [session, setSession] = useState<Session | null>(null)
  const [isValid, setIsValid] = useState(false)
  const [expiresIn, setExpiresIn] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const loadSession = useCallback(async () => {
    setLoading(true)
    const currentSession = await authSessionService.getCurrentSession()
    const valid = await authSessionService.isSessionValid()
    const expires = await authSessionService.getSessionExpiresIn()

    setSession(currentSession)
    setIsValid(valid)
    setExpiresIn(expires)
    setLoading(false)
  }, [])

  const refresh = useCallback(async () => {
    const refreshedSession = await authSessionService.refreshSession()
    setSession(refreshedSession)

    if (refreshedSession) {
      const valid = await authSessionService.isSessionValid()
      const expires = await authSessionService.getSessionExpiresIn()
      setIsValid(valid)
      setExpiresIn(expires)
    }
  }, [])

  useEffect(() => {
    loadSession()
  }, [loadSession])

  useEffect(() => {
    if (!expiresIn) return

    if (authSessionService.shouldRefreshSession(expiresIn)) {
      refresh()
    }
  }, [expiresIn, refresh])

  return {
    session,
    isValid,
    expiresIn,
    loading,
    refresh,
  }
}
