'use client'

import { useState, useEffect, useCallback } from 'react'
import { getContaAzulStatus, type IntegrationStatus } from '../actions'

interface UseIntegrationStatusProps {
  integrationType?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useIntegrationStatus(props?: UseIntegrationStatusProps) {
  const {
    integrationType = 'CONTA_AZUL',
    autoRefresh = false,
    refreshInterval = 30000,
  } = props ?? {}

  const [status, setStatus] = useState<IntegrationStatus>({
    isConnected: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()

  const fetchStatus = useCallback(async () => {
    try {
      if (integrationType !== 'CONTA_AZUL') {
        setStatus({ isConnected: false })
        return
      }
      setIsLoading(true)
      setError(undefined)
      const result = await getContaAzulStatus()
      setStatus(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status')
    } finally {
      setIsLoading(false)
    }
  }, [integrationType])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchStatus()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchStatus])

  return {
    status,
    isLoading,
    error,
    refresh: fetchStatus,
  }
}
