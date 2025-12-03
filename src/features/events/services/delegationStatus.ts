import { createClient } from '@/shared/lib/supabase/server'
import { OperationStatus } from '@/features/operations/config/operation-status'
import type { OperationRow, DelegationStatus } from '../model'

export type { DelegationStatus }

function isOperationStatus(value: string): value is OperationStatus {
  return Object.values(OperationStatus).includes(value as OperationStatus)
}

export async function getDelegationStatus(eventId: string): Promise<DelegationStatus> {
  const supabase = await createClient()

  const { data: operations, error } = await supabase
    .from('new_operations')
    .select('id, status')
    .eq('event_id', eventId)

  if (error) {
    throw new Error('Failed to check delegation status')
  }

  const totalOperations = operations?.length || 0
  const blockingStatuses = [OperationStatus.IN_PROGRESS, OperationStatus.VERIFIED]

  const blockingOperations =
    operations?.filter((op: OperationRow) => {
      if (!op.status) return false
      const upperStatus = op.status.toUpperCase()
      return isOperationStatus(upperStatus) && blockingStatuses.includes(upperStatus)
    }) || []

  const hasBlockingOperations = blockingOperations.length > 0

  const executedOperations =
    operations?.filter((op: OperationRow) => op.status?.toUpperCase() === OperationStatus.COMPLETED)
      .length || 0

  const pendingOperations = totalOperations - executedOperations

  if (totalOperations === 0) {
    return {
      hasOperations: false,
      totalOperations: 0,
      executedOperations: 0,
      pendingOperations: 0,
      canDelegate: true,
      delegationMode: 'initial',
      buttonText: 'Delegar Serviços',
      buttonIcon: 'plus',
      buttonVariant: 'primary',
      showPreview: false,
    }
  }

  if (hasBlockingOperations) {
    return {
      hasOperations: true,
      totalOperations,
      executedOperations,
      pendingOperations,
      canDelegate: false,
      delegationMode: 'blocked',
      buttonText: 'Operações em Andamento',
      buttonIcon: 'check',
      buttonVariant: 'outline',
      showPreview: false,
      hasBlockingOperations: true,
      warningMessage: `Não é possível gerar operações. Existem ${blockingOperations.length} operação(ões) em andamento ou verificadas.`,
    }
  }

  if (executedOperations === totalOperations) {
    return {
      hasOperations: true,
      totalOperations,
      executedOperations,
      pendingOperations: 0,
      canDelegate: false,
      delegationMode: 'completed',
      buttonText: 'Serviços Concluídos',
      buttonIcon: 'check',
      buttonVariant: 'outline',
      showPreview: false,
      warningMessage: 'Todas as operações foram executadas. Não é possível regerar.',
    }
  }

  if (executedOperations > 0) {
    return {
      hasOperations: true,
      totalOperations,
      executedOperations,
      pendingOperations,
      canDelegate: true,
      delegationMode: 'update',
      buttonText: 'Atualizar Serviços',
      buttonIcon: 'pencil',
      buttonVariant: 'secondary',
      showPreview: true,
      warningMessage: `${executedOperations} operação(ões) já executada(s) permanecerá(ão) inalterada(s)`,
    }
  }

  return {
    hasOperations: true,
    totalOperations,
    executedOperations: 0,
    pendingOperations,
    canDelegate: true,
    delegationMode: 'regenerate',
    buttonText: 'Regerar Serviços',
    buttonIcon: 'refresh',
    buttonVariant: 'secondary',
    showPreview: true,
  }
}

export function canDelegateEvent(event: {
  start_datetime: string | null
  event_type: string | null
}): { canDelegate: boolean; reason?: string } {
  if (!event.start_datetime) {
    return {
      canDelegate: false,
      reason: 'Evento sem data/hora de início definida',
    }
  }

  if (!event.event_type) {
    return {
      canDelegate: false,
      reason: 'Tipo de evento não definido',
    }
  }

  return { canDelegate: true }
}
