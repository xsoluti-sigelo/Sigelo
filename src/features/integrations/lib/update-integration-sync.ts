'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { logger } from '@/shared/lib/logger'

export async function updateIntegrationSyncTime(
  tenantId: string,
  integrationType: 'CONTA_AZUL',
): Promise<void> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('integrations' as never)
    .update({
      last_sync_at: now,
      updated_at: now,
    } as never)
    .eq('tenant_id', tenantId)
    .eq('integration_type', integrationType)

  if (error) {
    logger.warn('Failed to update last_sync_at in integrations', {
      tenantId,
      integrationType,
      error,
    })
  }
}
