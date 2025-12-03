import type { Database } from '@/types/database.types'

export type Integration = Database['public']['Tables']['integrations']['Row']
export type IntegrationInsert = Database['public']['Tables']['integrations']['Insert']
export type IntegrationUpdate = Database['public']['Tables']['integrations']['Update']

export type IntegrationType = 'CONTA_AZUL' | 'OUTROS'

export interface IntegrationConnection {
  integrationId: string
  integrationType: IntegrationType
  isActive: boolean
  connectedAt: string
  lastSyncAt?: string
}

export interface IntegrationCredentials {
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at: number
  token_type: string
  [key: string]: unknown
}

export interface IntegrationSettings {
  autoSync?: boolean
  syncInterval?: number
  [key: string]: unknown
}

export interface ConnectIntegrationResult {
  success: boolean
  integrationId?: string
  error?: string
}

export interface DisconnectIntegrationResult {
  success: boolean
  error?: string
}

export interface SyncResult {
  success: boolean
  syncedAt?: string
  itemsSynced?: number
  error?: string
}
