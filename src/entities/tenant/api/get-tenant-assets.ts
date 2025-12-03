'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { getUserData } from '@/entities/user'
import type { TenantAssetsResult } from '../model/types'

export async function getTenantAssets(): Promise<TenantAssetsResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { tenant_id } = await getUserData()

    const adminClient = createAdminClient()
    const { data: tenant, error: tenantError } = await adminClient
      .from('tenants')
      .select('logo_storage_path, banner_storage_path')
      .eq('id', tenant_id)
      .single()

    if (tenantError) {
      return { success: false, error: tenantError.message }
    }

    if (!tenant) {
      return { success: false, error: 'Tenant não encontrado' }
    }

    const assets: { logoUrl?: string; bannerUrl?: string } = {}

    if (tenant.logo_storage_path) {
      const { data: signedUrl } = await supabase.storage
        .from('tenant-attachments')
        .createSignedUrl(tenant.logo_storage_path, 3600)

      if (signedUrl) {
        assets.logoUrl = signedUrl.signedUrl
      }
    }

    if (tenant.banner_storage_path) {
      const { data: signedUrl } = await supabase.storage
        .from('tenant-attachments')
        .createSignedUrl(tenant.banner_storage_path, 3600)

      if (signedUrl) {
        assets.bannerUrl = signedUrl.signedUrl
      }
    }

    return {
      success: true,
      data: assets,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar assets do tenant',
    }
  }
}
