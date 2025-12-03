'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { getUserTenantId } from '@/entities/user'
import { logger } from '@/shared/lib/logger'
import type { Tables } from '@/shared/lib/supabase/types'
import type { ContaAzulPessoa, ContaAzulPessoaListItem } from '../../model'
import { ContaAzulPersonType } from '../../model'
import { PAGINATION } from '@/features/integrations/lib/constants'

type ContaAzulPessoaRow = Tables<'contaazul_pessoas'>

function mapRowToDomain(row: ContaAzulPessoaRow): ContaAzulPessoa {
  const personType = row.person_type ? (row.person_type.toUpperCase() as ContaAzulPersonType) : null

  return {
    id: row.id,
    tenant_id: row.tenant_id,
    conta_azul_id: row.conta_azul_id,
    name: row.name,
    person_type: personType,
    cpf: row.cpf,
    cnpj: row.cnpj,
    email: row.email,
    business_phone: row.business_phone,
    mobile_phone: row.mobile_phone,
    home_phone: row.home_phone,
    postal_code: row.postal_code,
    street: row.street,
    number: row.number,
    complement: row.complement,
    neighborhood: row.neighborhood,
    city_name: row.city_name,
    state: row.state,
    country_name: row.country_name,
    is_customer: Boolean(row.is_customer),
    is_supplier: Boolean(row.is_supplier),
    is_accountant: Boolean(row.is_accountant),
    is_partner: Boolean(row.is_partner),
    active: Boolean(row.active),
    last_synced_at: row.last_synced_at,
    sync_error: row.sync_error,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

interface GetContaAzulPessoasParams {
  page?: number
  pageSize?: number
  search?: string
  person_type?: string
  profile?: string
  active?: string
}

export async function getContaAzulPessoas(params: GetContaAzulPessoasParams = {}): Promise<{
  data: ContaAzulPessoaListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}> {
  const {
    page = 1,
    pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    search = '',
    person_type = '',
    profile = '',
    active = '',
  } = params

  const supabase = await createClient()
  const tenantId = await getUserTenantId()
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('contaazul_pessoas' as never)
    .select('*', { count: 'exact' })
    .eq('tenant_id', tenantId)

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,cpf.ilike.%${search}%,cnpj.ilike.%${search}%,email.ilike.%${search}%`,
    )
  }

  if (person_type) {
    query = query.eq('person_type', person_type)
  }

  if (profile) {
    const profileField = `is_${profile}`
    query = query.eq(profileField, true)
  }

  if (active) {
    query = query.eq('active', active === 'true')
  }

  const { data, error, count } = await query
    .order('name', { ascending: true })
    .range(offset, offset + pageSize - 1)

  if (error) {
    if (error.code === 'PGRST205') {
      logger.warn(
        'Schema cache issue - table not in cache yet. Restart the Supabase project or wait a few minutes.',
        { tenantId, error },
      )

      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      }
    }

    logger.error('Error fetching Conta Azul pessoas', error, { tenantId })

    return {
      data: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    }
  }

  const items = (data ?? []).map(mapRowToDomain)
  const total = count || 0
  const totalPages = Math.ceil(total / pageSize)

  return {
    data: items,
    total,
    page,
    pageSize,
    totalPages,
  }
}

export async function getContaAzulPessoaById(id: string): Promise<ContaAzulPessoa | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contaazul_pessoas' as never)
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch pessoa: ${error.message}`)
  }

  return data ? mapRowToDomain(data as ContaAzulPessoaRow) : null
}

export async function getContaAzulPessoaByContaAzulId(
  contaAzulId: string,
): Promise<ContaAzulPessoa | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contaazul_pessoas' as never)
    .select('*')
    .eq('conta_azul_id', contaAzulId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch pessoa by Conta Azul ID: ${error.message}`)
  }

  return data ? mapRowToDomain(data as ContaAzulPessoaRow) : null
}

export async function getAllContaAzulCustomers(): Promise<ContaAzulPessoaListItem[]> {
  const supabase = await createClient()
  const tenantId = await getUserTenantId()

  const { data, error } = await supabase
    .from('contaazul_pessoas' as never)
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name', { ascending: true })

  if (error) {
    logger.error('Error fetching all Conta Azul pessoas', error, { tenantId })
    throw new Error('Failed to fetch pessoas')
  }

  return (data ?? []).map(mapRowToDomain)
}

export async function getContaAzulCustomers(
  page: number = 1,
  pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE,
): Promise<{
  data: ContaAzulPessoaListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}> {
  const supabase = await createClient()
  const tenantId = await getUserTenantId()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('contaazul_pessoas' as never)
    .select('*', { count: 'exact' })
    .eq('tenant_id', tenantId)
    .eq('is_customer', true)
    .eq('active', true)
    .order('name', { ascending: true })
    .range(from, to)

  if (error) {
    throw new Error(`Failed to fetch customers: ${error.message}`)
  }

  const items = (data ?? []).map(mapRowToDomain)
  const total = count || 0
  const totalPages = Math.ceil(total / pageSize)

  return {
    data: items,
    total,
    page,
    pageSize,
    totalPages,
  }
}

export async function searchContaAzulPessoas(query: string): Promise<ContaAzulPessoaListItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contaazul_pessoas' as never)
    .select('*')
    .or(`name.ilike.%${query}%,cpf.ilike.%${query}%,cnpj.ilike.%${query}%,email.ilike.%${query}%`)
    .eq('active', true)
    .order('name', { ascending: true })
    .limit(50)

  if (error) {
    throw new Error(`Failed to search pessoas: ${error.message}`)
  }

  return (data ?? []).map(mapRowToDomain)
}
