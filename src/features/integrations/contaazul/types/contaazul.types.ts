export interface ContaAzulTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  expires_at?: number
}

export interface ContaAzulCustomerRaw {
  uuid?: string
  id_pessoa?: string
  id?: string
  id_legado?: number
  nome_razao_social?: string
  nome?: string
  name?: string
  nome_fantasia?: string
  codigo?: string
  documento?: string
  cpf_cnpj?: string
  documentNumber?: string
  email?: string | null
  telefone?: string
  phone?: string
  ativo?: boolean
  tipo_pessoa?: 'FISICA' | 'JURIDICA'
  perfis?: string[]
  data_nascimento?: string
  rg?: string
  observacao?: string
  observacoes_gerais?: string
  optante_simples_nacional?: boolean
  optante_simples?: boolean
  orgao_publico?: boolean
  agencia_publica?: boolean
  inscricoes?: Array<{
    id?: string
    indicador_inscricao_estadual?: string
    inscricao_estadual?: string
    inscricao_municipal?: string
    inscricao_suframa?: string
  }>
  endereco?: {
    uuid?: string
    logradouro?: string
    numero?: string
    complemento?: string
    bairro?: string
    cep?: string
    cidade_id?: number
    cidade?: string
    estado?: string
    pais?: string
  }
  address?: {
    street?: string
    number?: string
    complement?: string
    neighborhood?: string
    postalCode?: string
    cityId?: string
  }
}

export interface ContaAzulCustomer {
  id?: string
  name: string
  email?: string
  documentNumber?: string
  address?: {
    street?: string
    number?: string
    complement?: string
    neighborhood?: string
    postalCode?: string
    cityId?: string
  }
  phone?: string
  mobilePhone?: string
}

export interface ContaAzulProduct {
  id?: string
  name: string
  costRate?: number
  rate: number
  currentStock?: number
  category?: string
}

export type ContaAzulServiceStatus = 'ATIVO' | 'INATIVO'

export type ContaAzulServiceType = 'PRESTADO' | 'TOMADO' | 'AMBOS'

export interface ContaAzulServiceCity {
  codigo?: number | string | null
  nome?: string | null
  uf?: string | null
}

export interface ContaAzulServiceTaxScenario {
  id?: string | null
  inss_aliquota?: number | null
  iss_aliquota?: number | null
  iss_retido?: boolean | null
  municipio?: ContaAzulServiceCity | null
  nome_usuario?: string | null
  ultima_atualizacao?: string | null
}

export interface ContaAzulServiceRaw {
  id?: string | null
  id_servico?: number | null
  id_externo?: string | null
  codigo?: string | null
  descricao?: string | null
  custo?: number | null
  preco?: number | null
  status?: ContaAzulServiceStatus | null
  tipo_servico?: ContaAzulServiceType | null
  codigo_cnae?: string | null
  codigo_municipio_servico?: string | null
  lei_116?: string | null
  lista_cenario_tributario?: ContaAzulServiceTaxScenario[] | null
  natureza_operacional?: {
    id?: string | null
  } | null
}

export interface ContaAzulServicePagination {
  pagina_atual?: number | null
  tamanho_pagina?: number | null
  total_itens?: number | null
  total_paginas?: number | null
}

export interface ContaAzulServicesResponse {
  itens?: ContaAzulServiceRaw[] | null
  paginacao?: ContaAzulServicePagination | null
}

export interface ContaAzulService {
  id?: string
  idServico?: number | null
  externalId?: string | null
  code?: string | null
  name: string
  description?: string | null
  costRate?: number | null
  rate: number
  status?: ContaAzulServiceStatus | null
  serviceType?: ContaAzulServiceType | null
  cnaeCode?: string | null
  municipalServiceCode?: string | null
  law116?: string | null
  taxScenarios?: ContaAzulServiceTaxScenario[] | null
  operationalNatureId?: string | null
}

export interface ContaAzulSaleItem {
  product?: {
    id: string
  }
  service?: {
    id: string
  }
  quantity: number
  unitPrice: number
  total: number
  description?: string
}

export interface ContaAzulSale {
  id?: string
  number?: number
  customer: {
    id: string
  }
  saleDate: string
  category?: string
  costCenter?: string
  seller?: string
  items: ContaAzulSaleItem[]
  paymentMethod?: string
  receivingAccount?: string
  paymentCondition?: string
  paymentDueDate?: string
  paymentNotes?: string
  serviceLocation?: string
  customerIsSimplesTaxPayer?: boolean
  invoiceNotes?: string
  status?: 'DRAFT' | 'APPROVED' | 'CANCELLED'
}

export interface ContaAzulErrorResponse {
  error: string
  error_description?: string
  message?: string
}

export interface ContaAzulCreateSaleResponse {
  id?: string
  uuid?: string
  numero?: number
  number?: number
  [key: string]: unknown
}
