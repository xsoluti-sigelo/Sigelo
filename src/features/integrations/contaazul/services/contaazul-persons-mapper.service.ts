import { ContaAzulPersonType } from '../model'
import type { ContaAzulCustomerRaw } from '../types/contaazul.types'
import type { TablesInsert } from '@/shared/lib/supabase/types'

export type ContaAzulPessoaUpsert = TablesInsert<'contaazul_pessoas'>

function sanitizeDigits(value?: string | null): string | null {
  if (!value) return null
  const only = value.replace(/[^\d]/g, '')
  return only || null
}

function normalizePersonType(tipo?: string | null): ContaAzulPersonType | null {
  if (!tipo) return null
  const normalized = tipo
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()
  if (normalized.includes('FISICA')) return ContaAzulPersonType.NATURAL
  if (normalized.includes('JURIDICA')) return ContaAzulPersonType.LEGAL
  if (normalized.includes('ESTRANGEIRO')) return ContaAzulPersonType.FOREIGN
  return null
}

function mapProfileTypes(profiles: string[] = []) {
  const normalized = profiles.map((profile) =>
    profile
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toUpperCase(),
  )

  return {
    is_customer: normalized.includes('CLIENTE') || normalized.includes('CUSTOMER'),
    is_supplier: normalized.includes('FORNECEDOR') || normalized.includes('SUPPLIER'),
    is_accountant: normalized.includes('CONTADOR') || normalized.includes('ACCOUNTANT'),
    is_partner: normalized.includes('SOCIO') || normalized.includes('PARTNER'),
  }
}

export function mapContaAzulRawToUpsert(
  pessoa: ContaAzulCustomerRaw,
  tenantId: string,
  nowISO: string,
): ContaAzulPessoaUpsert | null {
  const rawWithUuid = pessoa as Record<string, unknown>
  const rawId = rawWithUuid.uuid || (pessoa as Record<string, unknown>)['id_pessoa'] || pessoa.id

  if (typeof rawId !== 'string' || rawId.length === 0) {
    return null
  }

  const profileTypes = mapProfileTypes(pessoa.perfis || [])
  const document = sanitizeDigits(pessoa.documento || pessoa.cpf_cnpj || pessoa.documentNumber)
  const personType = normalizePersonType(
    (pessoa as unknown as { tipo_pessoa?: string | null }).tipo_pessoa,
  )

  const name = pessoa.nome_razao_social || pessoa.nome || pessoa.name || ''
  const address = pessoa.endereco || pessoa.address

  const firstInscricao = pessoa.inscricoes?.[0]

  return {
    tenant_id: tenantId,
    conta_azul_id: rawId,
    name,
    person_type: personType,
    cpf: personType === ContaAzulPersonType.NATURAL ? document : null,
    cnpj: personType === ContaAzulPersonType.LEGAL ? document : null,
    email: pessoa.email || null,
    business_phone: pessoa.telefone || pessoa.phone || null,
    mobile_phone: null,
    home_phone: null,
    postal_code:
      (address as Record<string, string | null | undefined>)?.cep ||
      (address as Record<string, string | null | undefined>)?.postalCode ||
      null,
    street:
      (address as Record<string, string | null | undefined>)?.logradouro ||
      (address as Record<string, string | null | undefined>)?.street ||
      null,
    number:
      (address as Record<string, string | null | undefined>)?.numero ||
      (address as Record<string, string | null | undefined>)?.number ||
      null,
    complement:
      (address as Record<string, string | null | undefined>)?.complemento ||
      (address as Record<string, string | null | undefined>)?.complement ||
      null,
    neighborhood:
      (address as Record<string, string | null | undefined>)?.bairro ||
      (address as Record<string, string | null | undefined>)?.neighborhood ||
      null,
    city_name: (address as Record<string, string | null | undefined>)?.cidade || null,
    state: (address as Record<string, string | null | undefined>)?.estado || null,
    country_name: (address as Record<string, string | null | undefined>)?.pais || 'Brasil',
    codigo: pessoa.codigo?.trim() || null,
    nome_fantasia: pessoa.nome_fantasia?.trim() || null,
    data_nascimento: pessoa.data_nascimento || null,
    rg: pessoa.rg?.trim() || null,
    observacao: pessoa.observacao || pessoa.observacoes_gerais || null,
    optante_simples_nacional: pessoa.optante_simples_nacional ?? pessoa.optante_simples ?? null,
    orgao_publico: pessoa.orgao_publico ?? pessoa.agencia_publica ?? null,
    id_legado: pessoa.id_legado || null,
    inscricao_estadual: firstInscricao?.inscricao_estadual?.trim() || null,
    inscricao_municipal: firstInscricao?.inscricao_municipal?.trim() || null,
    inscricao_suframa: firstInscricao?.inscricao_suframa?.trim() || null,
    indicador_ie: firstInscricao?.indicador_inscricao_estadual?.trim() || null,
    ...profileTypes,
    active: pessoa.ativo !== false,
    last_synced_at: nowISO,
    sync_error: null,
    updated_at: nowISO,
  }
}
