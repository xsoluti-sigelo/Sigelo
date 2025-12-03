'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getContaAzulAuthUrl, disconnectContaAzul, refreshContaAzulToken } from '../actions'
import { showSuccessToast, showErrorToast } from '@/shared/lib/toast'

export function useContaAzulConnectionHandlers() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)

    try {
      const result = await getContaAzulAuthUrl()

      if (result.success && result.authUrl) {
        const url = new URL(result.authUrl)
        const redirectUri = url.searchParams.get('redirect_uri')

        const confirmed = confirm(`URL de callback que será enviada:\n${redirectUri}\n\nContinuar?`)

        if (confirmed) {
          window.location.href = result.authUrl
        } else {
          setIsConnecting(false)
        }
      } else {
        showErrorToast(result.error || 'Erro ao conectar')
        setIsConnecting(false)
      }
    } catch {
      showErrorToast('Erro ao conectar com Conta Azul')
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    startTransition(async () => {
      const result = await disconnectContaAzul()

      if (result.success) {
        showSuccessToast('Conta Azul desconectada com sucesso')
        router.refresh()
      } else {
        showErrorToast(result.error || 'Erro ao desconectar')
      }
    })
  }

  const handleRefreshToken = () => {
    startTransition(async () => {
      const result = await refreshContaAzulToken()

      if (result.success) {
        showSuccessToast('Reconectado com sucesso')
        router.refresh()
      } else {
        showErrorToast(result.error || 'Erro ao reconectar')
      }
    })
  }

  return {
    handleConnect,
    handleDisconnect,
    handleRefreshToken,
    isConnecting,
    isPending,
  }
}
