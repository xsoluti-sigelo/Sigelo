'use server'

import { getUserData } from '@/entities/user'
import { logger } from '@/shared/lib/logger'
import { headers } from 'next/headers'
import { getContaAzulConfig } from '../contaazul/lib/env-validator'

export async function getContaAzulAuthUrl() {
  try {
    const userData = await getUserData()

    if (!userData?.tenant_id) {
      return {
        success: false,
        error: 'NÃo autorizado',
      }
    }

    const config = getContaAzulConfig()
    const hdrs = await headers()
    const forwardedProto = hdrs.get('x-forwarded-proto') || 'https'
    const forwardedHost = hdrs.get('x-forwarded-host') || hdrs.get('host') || 'localhost:3000'
    const redirectUri = `${forwardedProto}://${forwardedHost}/api/contaazul/callback`

    logger.info('Conta Azul Config loaded', {
      hasClientId: !!config.clientId,
      hasRedirectUri: !!redirectUri,
      tenantId: userData.tenant_id,
    })

    if (!redirectUri) {
      return {
        success: false,
        error: 'Configuração da Conta Azul não encontrada',
      }
    }

    const state = crypto.randomUUID()

    const scope = encodeURIComponent('openid profile aws.cognito.signin.user.admin')
    const encodedRedirectUri = encodeURIComponent(redirectUri)
    const encodedClientId = encodeURIComponent(config.clientId)
    const encodedState = encodeURIComponent(state)

    const authUrl = `${config.authUrl}?response_type=code&client_id=${encodedClientId}&redirect_uri=${encodedRedirectUri}&state=${encodedState}&scope=${scope}`

    logger.info('Generated Conta Azul auth URL', {
      tenantId: userData.tenant_id,
      state,
    })

    return {
      success: true,
      authUrl,
      state,
    }
  } catch (error) {
    logger.error('Failed to generate auth URL', error as Error)
    return {
      success: false,
      error: 'Erro ao gerar URL de autorização',
    }
  }
}
