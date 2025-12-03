export enum ContaAzulPersonType {
  NATURAL = 'NATURAL',
  LEGAL = 'LEGAL',
  FOREIGN = 'FOREIGN',
}

export enum ContaAzulPersonProfile {
  CUSTOMER = 'customer',
  SUPPLIER = 'supplier',
  ACCOUNTANT = 'accountant',
  PARTNER = 'partner',
}

export interface ContaAzulPessoa {
  id: string
  tenant_id: string
  conta_azul_id: string
  name: string
  person_type: ContaAzulPersonType | null
  cpf: string | null
  cnpj: string | null
  email: string | null
  business_phone: string | null
  mobile_phone: string | null
  home_phone: string | null
  postal_code: string | null
  street: string | null
  number: string | null
  complement: string | null
  neighborhood: string | null
  city_name: string | null
  state: string | null
  country_name: string | null
  is_customer: boolean
  is_supplier: boolean
  is_accountant: boolean
  is_partner: boolean
  active: boolean
  last_synced_at: string | null
  sync_error: string | null
  created_at: string | null
  updated_at: string | null
}

export type ContaAzulPessoaListItem = ContaAzulPessoa

export type ContaAzulPessoaCreate = Omit<
  ContaAzulPessoa,
  'id' | 'created_at' | 'updated_at' | 'last_synced_at'
>

export type ContaAzulPessoaUpdate = Partial<ContaAzulPessoaCreate>
