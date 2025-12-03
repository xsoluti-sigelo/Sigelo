import type { Database } from '@/types/database.types'

export type Tenant = Database['public']['Tables']['tenants']['Row']

export interface TenantAssets {
  logoUrl?: string
  bannerUrl?: string
}

export interface TenantAssetsResult {
  success: boolean
  data?: TenantAssets
  error?: string
}
