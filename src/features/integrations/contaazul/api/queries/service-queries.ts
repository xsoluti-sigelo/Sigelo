'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { getUserTenantId } from '@/entities/user'
import { logger } from '@/shared/lib/logger'
import type { ContaAzulServiceRecord } from '../../model'

const ITEMS_PER_PAGE = 15

interface GetContaAzulServicesParams {
  page?: number
  search?: string
  costFilter?: 'with' | 'without' | 'missing'
  priceFilter?: 'with' | 'without' | 'missing'
}

export async function getContaAzulServices(params: GetContaAzulServicesParams = {}) {
  const { page = 1, search = '', costFilter, priceFilter } = params
  const supabase = await createClient()
  const tenantId = await getUserTenantId()

  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  let query = supabase
    .from('contaazul_services' as never)
    .select('*', { count: 'exact' })
    .eq('tenant_id', tenantId)

  if (search) {
    const sanitized = search.trim()
    if (sanitized.length > 0) {
      query = query.or(`name.ilike.%${sanitized}%,contaazul_id.ilike.%${sanitized}%`)
    }
  }

  if (costFilter === 'with') {
    query = query.gt('cost_rate', 0)
  } else if (costFilter === 'without') {
    query = query.lte('cost_rate', 0)
  } else if (costFilter === 'missing') {
    query = query.is('cost_rate', null)
  }

  if (priceFilter === 'with') {
    query = query.gt('rate', 0)
  } else if (priceFilter === 'without') {
    query = query.lte('rate', 0)
  } else if (priceFilter === 'missing') {
    query = query.is('rate', null)
  }

  const { data, error, count } = await query.order('name', { ascending: true }).range(from, to)

  if (error) {
    logger.error('Error fetching Conta Azul services', error, { tenantId })
    throw new Error('Failed to fetch services')
  }

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0

  return {
    services: (data || []) as ContaAzulServiceRecord[],
    totalPages,
    totalCount: count || 0,
    currentPage: page,
  }
}

export async function getAllContaAzulServices() {
  const supabase = await createClient()
  const tenantId = await getUserTenantId()

  const { data, error } = await supabase
    .from('contaazul_services' as never)
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name', { ascending: true })

  if (error) {
    logger.error('Error fetching all Conta Azul services', error, { tenantId })
    throw new Error('Failed to fetch services')
  }

  return (data || []) as ContaAzulServiceRecord[]
}

export async function getLastSyncDate() {
  const supabase = await createClient()
  const tenantId = await getUserTenantId()

  const { data, error } = await supabase
    .from('contaazul_services' as never)
    .select('synced_at')
    .eq('tenant_id', tenantId)
    .order('synced_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    logger.error('Error fetching last sync date', error, { tenantId })
  }

  return (data as { synced_at: string } | null)?.synced_at || null
}
