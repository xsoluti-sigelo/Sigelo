export interface ContaAzulServiceRecord {
  id: string
  tenant_id: string
  contaazul_id: string
  name: string
  cost_rate: number | null
  rate: number
  synced_at: string | null
  created_at: string | null
  updated_at: string | null
}

export interface SyncServicesResult {
  success: boolean
  count?: number
  created?: number
  updated?: number
  errors?: number
  lastSyncedAt?: string
  error?: string
}
