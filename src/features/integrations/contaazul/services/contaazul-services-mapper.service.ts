import type { TablesInsert } from '@/shared/lib/supabase/types'
import type { ContaAzulService } from '../types/contaazul.types'

export type ContaAzulServiceUpsert = TablesInsert<'contaazul_services'>

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const toNumberOrZero = (value: unknown): number => {
  if (value === null || value === undefined) return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Number(parsed) : 0
}

const resolveContaAzulId = (service: ContaAzulService): string => {
  const candidates = [service.id, service.externalId, service.code, service.name]

  return (
    candidates
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .find((value) => value.length > 0) || ''
  )
}

export function mapContaAzulServiceToUpsert(
  service: ContaAzulService,
  tenantId: string,
  nowISOString: string,
): ContaAzulServiceUpsert {
  const contaAzulId = resolveContaAzulId(service)

  return {
    tenant_id: tenantId,
    contaazul_id: contaAzulId,
    name: service.name?.trim() || contaAzulId,
    cost_rate: toNumberOrNull(service.costRate),
    rate: toNumberOrZero(service.rate),
    tipo_servico: service.serviceType || null,
    status: service.status || null,
    codigo: service.code?.trim() || null,
    codigo_cnae: service.cnaeCode?.trim() || null,
    id_servico: toNumberOrNull(service.idServico),
    synced_at: nowISOString,
    updated_at: nowISOString,
  }
}
