'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { getUserData } from '@/entities/user'
import {
  formatTokenTimeRemaining,
  getTokenExpirationStatus,
} from '../contaazul/lib/contaazul-utils'
import type { ContaAzulTokens } from '../types'

export interface IntegrationStatus {
  isConnected: boolean
  lastSyncAt?: string
  expiresAt?: number
  expiresIn?: string
  expirationStatus?: 'expired' | 'expiring-soon' | 'valid'
  connectedBy?: string
}

export async function getContaAzulStatus(): Promise<IntegrationStatus> {
  try {
    const userData = await getUserData()

    if (!userData?.tenant_id) {
      return { isConnected: false }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('integrations' as never)
      .select('is_active, last_sync_at, connected_by, encrypted_credentials_vault_id')
      .eq('tenant_id', userData.tenant_id)
      .eq('integration_type', 'CONTA_AZUL')
      .maybeSingle()

    if (error || !data) {
      return { isConnected: false }
    }

    const integration = data as {
      is_active: boolean
      last_sync_at: string | null
      connected_by: string | null
      encrypted_credentials_vault_id: string | null
    }

    let connectedByEmail: string | undefined

    if (integration.connected_by) {
      try {
        const { data: user } = await supabase
          .from('users' as never)
          .select('email')
          .eq('id', integration.connected_by)
          .single()

        connectedByEmail = (user as { email?: string } | null)?.email || undefined
      } catch {
        connectedByEmail = undefined
      }
    }

    let tokens: ContaAzulTokens | null = null

    if (integration.is_active && integration.encrypted_credentials_vault_id) {
      const { data: credentials } = await supabase.rpc('get_decrypted_credentials', {
        p_tenant_id: userData.tenant_id,
        p_integration_type: 'CONTA_AZUL',
      })

      if (credentials) {
        tokens = credentials as unknown as ContaAzulTokens
      }
    }

    const expirationStatus = tokens ? getTokenExpirationStatus(tokens) : undefined

    return {
      isConnected: integration.is_active,
      lastSyncAt: integration.last_sync_at || undefined,
      expiresAt: tokens?.expires_at,
      expiresIn: tokens ? formatTokenTimeRemaining(tokens) : undefined,
      expirationStatus: expirationStatus?.status,
      connectedBy: connectedByEmail,
    }
  } catch {
    return { isConnected: false }
  }
}
