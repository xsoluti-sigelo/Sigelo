'use server'

import { getDelegationStatus } from '../../services/delegationStatus'
import type { DelegationStatus } from '../../services/delegationStatus'

export async function getDelegationStatusAction(eventId: string): Promise<DelegationStatus> {
  try {
    return await getDelegationStatus(eventId)
  } catch {
    return {
      hasOperations: false,
      totalOperations: 0,
      executedOperations: 0,
      pendingOperations: 0,
      canDelegate: true,
      delegationMode: 'initial' as const,
      buttonText: 'Delegar Serviços',
      buttonIcon: 'plus' as const,
      buttonVariant: 'primary' as const,
      showPreview: false,
    }
  }
}
