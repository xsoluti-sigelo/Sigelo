'use server'

import { getUserData } from '@/entities/user'
import { revalidatePath } from 'next/cache'
import { logger } from '@/shared/lib/logger'
import { ROUTES } from '@/shared/config/constants'
import { deleteContaAzulTokens } from '../contaazul/services/contaazul-token.service'

export async function disconnectContaAzul() {
  try {
    const userData = await getUserData()

    if (!userData?.tenant_id) {
      return {
        success: false,
        error: 'Não autorizado',
      }
    }

    await deleteContaAzulTokens(userData.tenant_id)

    logger.info('Conta Azul integration disconnected', {
      tenantId: userData.tenant_id,
      userId: userData.id,
    })

    revalidatePath(ROUTES.INTEGRATIONS)

    return {
      success: true,
    }
  } catch (error) {
    logger.error('Failed to disconnect Conta Azul', error as Error)
    return {
      success: false,
      error: 'Erro ao desconectar Conta Azul',
    }
  }
}
