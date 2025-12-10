'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/client'
import { ROUTES } from '@/shared/config'
import { logger } from '@/shared/lib/logger'

type InviteSessionState = {
  isProcessing: boolean
  error: string | null
}

export function useInviteSession() {
  const router = useRouter()
  const [state, setState] = useState<InviteSessionState>({
    isProcessing: false,
    error: null,
  })

  useEffect(() => {
    const handleInviteTokens = async () => {
      const hash = window.location.hash
      if (!hash || !hash.includes('access_token')) {
        return
      }

      setState({ isProcessing: true, error: null })

      try {
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const type = params.get('type')

        if (!accessToken || !refreshToken) {
          logger.warn('Missing tokens in invite hash', { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken })
          setState({ isProcessing: false, error: null })
          return
        }

        logger.info('Processing invite tokens from hash', { type })

        const supabase = createClient()

        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          logger.error('Failed to set session from invite tokens', error)
          setState({ isProcessing: false, error: 'Erro ao processar convite. Tente novamente.' })
          return
        }

        if (!data.user) {
          logger.error('No user returned after setting session')
          setState({ isProcessing: false, error: 'Erro ao processar convite. Tente novamente.' })
          return
        }

        logger.info('Session set successfully from invite tokens', {
          userId: data.user.id,
          email: data.user.email,
        })

        window.history.replaceState(null, '', window.location.pathname)

        const inviteToken = data.user.user_metadata?.invite_token

        if (inviteToken) {
          logger.info('Redirecting to finalize invite', { inviteToken: inviteToken.substring(0, 8) + '...' })
          router.push(`/api/auth/finalize-invite?token=${inviteToken}`)
        } else {
          logger.info('No invite token in metadata, redirecting to dashboard')
          router.push(ROUTES.DASHBOARD)
        }
      } catch (err) {
        logger.error('Unexpected error processing invite tokens', err instanceof Error ? err : new Error(String(err)))
        setState({ isProcessing: false, error: 'Erro inesperado ao processar convite.' })
      }
    }

    handleInviteTokens()
  }, [router])

  return state
}
