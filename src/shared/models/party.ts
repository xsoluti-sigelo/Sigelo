export interface PartyContactBase {
  contact_type: string
  contact_value: string
  is_primary?: boolean | null
}

export interface PartyContact extends PartyContactBase {
  id: string
  tenant_id?: string
  party_id?: string
  active?: boolean
  created_at?: string
  updated_at?: string
}

export interface PartyBase {
  id: string
  display_name: string
  party_type?: string | null
  full_name?: string | null
  party_contacts?: PartyContactBase[]
}

export interface Party extends PartyBase {
  tenant_id: string
  active: boolean
  created_at: string
  updated_at: string
  party_contacts?: PartyContact[]
  party_roles?: PartyRole[]
}

export interface PartyRole {
  id: string
  tenant_id: string
  party_id: string
  role_type: string
  is_driver: boolean
  active: boolean
  created_at: string
  updated_at: string
}

export interface EventParty extends PartyBase {
  person_type?: string | null
  name?: string
  cpf?: string | null
  cnpj?: string | null
  legal_name?: string | null
  trade_name?: string | null
  email?: string | null
  business_phone?: string | null
  mobile_phone?: string | null
}
