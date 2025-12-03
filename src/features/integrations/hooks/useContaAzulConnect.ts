'use client'

import { useState, useCallback } from 'react'
import { getContaAzulAuthUrl, disconnectContaAzul } from '../actions'

interface UseContaAzulConnectProps {
  onConnectStart?: () => void
  onDisconnectSuccess?: () => void
  onError?: (error: string) => void
}

export function useContaAzulConnect(props?: UseContaAzulConnectProps) {
  const { onConnectStart, onDisconnectSuccess, onError } = props ?? {}

  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [error, setError] = useState<string>()

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true)
      setError(undefined)

      const result = await getContaAzulAuthUrl()

      if (result.error) {
        setError(result.error)
        onError?.(result.error)
        return
      }

      if (result.authUrl) {
        onConnectStart?.()
        window.location.href = result.authUrl
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }, [onConnectStart, onError])

  const disconnect = useCallback(async () => {
    try {
      setIsDisconnecting(true)
      setError(undefined)

      const result = await disconnectContaAzul()

      if (!result.success) {
        const errorMessage = result.error || 'Failed to disconnect'
        setError(errorMessage)
        onError?.(errorMessage)
        return result
      }

      onDisconnectSuccess?.()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect'
      setError(errorMessage)
      onError?.(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsDisconnecting(false)
    }
  }, [onDisconnectSuccess, onError])

  return {
    connect,
    disconnect,
    isConnecting,
    isDisconnecting,
    error,
  }
}
