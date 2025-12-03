'use server'

import { revalidatePath } from 'next/cache'
import { getUserData } from '@/entities/user'
import { logger } from '@/shared/lib/logger'
import { ROUTES } from '@/shared/config/constants'
import { getContaAzulTokens, refreshContaAzulTokens } from '../services'

export async function refreshContaAzulToken(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const userData = await getUserData()

    if (!userData?.tenant_id) {
      return { success: false, error: 'User not authenticated' }
    }

    const tokens = await getContaAzulTokens(userData.tenant_id)

    if (!tokens) {
      return { success: false, error: 'No tokens found' }
    }

    await refreshContaAzulTokens(tokens.refresh_token, userData.tenant_id)

    logger.info('Conta Azul token refreshed successfully', {
      tenantId: userData.tenant_id,
      userId: userData.id,
    })

    revalidatePath(ROUTES.INTEGRATIONS)

    return { success: true }
  } catch (error) {
    logger.error('Failed to refresh token', error as Error, {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refresh token',
    }
  }
}
