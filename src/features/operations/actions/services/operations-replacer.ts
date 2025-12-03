import type { OperationData } from '../../lib/operation-calculations'
import type { GenerateOperationsResult, ReplaceOperationsOptions } from '../../types/operation.types'
import type { SupabaseClient, UserContext } from '../../model/shared-types'
import { recordOperationRegenerationLog } from './operation-logger'

export async function replaceEventOperations(
  supabase: SupabaseClient,
  eventId: string,
  operations: OperationData[],
  userData: UserContext,
  options?: ReplaceOperationsOptions,
): Promise<GenerateOperationsResult> {
 
  const { data: existingOperations, error: fetchError } = await supabase
    .from('new_operations')
    .select('id, status')
    .eq('event_id', eventId)

  if (fetchError) {
    return { success: false, error: 'Erro ao atualizar operações' }
  }

  const completedCount =
    existingOperations?.filter((operation) => operation.status === 'COMPLETED').length ?? 0
  const totalExisting = existingOperations?.length ?? 0
  const pendingCount = totalExisting > completedCount ? totalExisting - completedCount : 0

  const { error: deleteError } = await supabase
    .from('new_operations')
    .delete()
    .eq('event_id', eventId)
    .neq('status', 'COMPLETED')

  if (deleteError) {
    return { success: false, error: 'Erro ao atualizar operações' }
  }

  if (operations.length > 0) {
    const { error: insertError } = await supabase.from('new_operations').insert(operations as never)
    if (insertError) {
      return { success: false, error: 'Erro ao salvar operações' }
    }
  }

  await recordOperationRegenerationLog(
    eventId,
    userData,
    {
      pendingRemoved: pendingCount,
      insertedCount: operations.length,
      completedCount,
    },
    options,
  )

  return { success: true, operations }
}
