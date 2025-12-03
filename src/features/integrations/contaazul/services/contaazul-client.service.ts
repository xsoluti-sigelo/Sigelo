import { logger } from '@/shared/lib/logger'
import type {
  ContaAzulTokens,
  ContaAzulCustomer,
  ContaAzulCustomerRaw,
  ContaAzulProduct,
  ContaAzulService,
  ContaAzulServiceRaw,
  ContaAzulServicesResponse,
  ContaAzulSale,
  ContaAzulErrorResponse,
  ContaAzulCreateSaleResponse,
} from '../types/contaazul.types'

function normalizeCustomer(raw: ContaAzulCustomerRaw): ContaAzulCustomer {
  const rawWithUuid = raw as Record<string, unknown>
  const customerId = rawWithUuid.uuid || raw.id_pessoa || raw.id

  return {
    id: typeof customerId === 'string' ? customerId : undefined,
    name: raw.nome_razao_social || raw.nome || raw.name || '',
    documentNumber: raw.documento || raw.cpf_cnpj || raw.documentNumber,
    email: raw.email || undefined,
    phone: raw.telefone || raw.phone,
    address: raw.endereco
      ? {
          street: raw.endereco.logradouro,
          number: raw.endereco.numero,
          complement: raw.endereco.complemento,
          neighborhood: raw.endereco.bairro,
          postalCode: raw.endereco.cep,
          cityId: raw.endereco.cidade_id?.toString(),
        }
      : raw.address,
  }
}

const CONTA_AZUL_AUTH_URL = 'https://auth.contaazul.com/oauth2'
const CONTA_AZUL_API_URL = 'https://api-v2.contaazul.com'

const toNumberOrDefault = (value: unknown, fallback = 0): number => {
  if (value === null || value === undefined) {
    return fallback
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const normalizeService = (raw: ContaAzulServiceRaw | null | undefined): ContaAzulService | null => {
  if (!raw) {
    return null
  }

  const description = raw.descricao?.trim() || ''
  const code = raw.codigo?.trim() || ''
  const displayName = description || code || raw.id || raw.id_externo || 'Servico sem nome'

  return {
    id: raw.id ?? undefined,
    idServico: raw.id_servico ?? null,
    externalId: raw.id_externo ?? null,
    code: code || null,
    name: displayName,
    description: description || null,
    rate: toNumberOrDefault(raw.preco),
    costRate: toNumberOrNull(raw.custo),
    status: raw.status ?? null,
    serviceType: raw.tipo_servico ?? null,
    cnaeCode: raw.codigo_cnae ?? null,
    municipalServiceCode: raw.codigo_municipio_servico ?? null,
    law116: raw.lei_116 ?? null,
    taxScenarios: raw.lista_cenario_tributario ?? null,
    operationalNatureId: raw.natureza_operacional?.id ?? null,
  }
}

export class ContaAzulClient {
  private clientId: string
  private clientSecret: string
  private redirectUri: string
  private tenantId: string

  constructor(config: {
    clientId: string
    clientSecret: string
    redirectUri: string
    tenantId: string
  }) {
    this.clientId = config.clientId
    this.clientSecret = config.clientSecret
    this.redirectUri = config.redirectUri
    this.tenantId = config.tenantId
  }

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state,
      scope: 'openid profile aws.cognito.signin.user.admin',
    })

    return `${CONTA_AZUL_AUTH_URL}/authorize?${params.toString()}`
  }

  async getAccessToken(code: string): Promise<ContaAzulTokens> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
    })

    const response = await fetch(`${CONTA_AZUL_AUTH_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const error: ContaAzulErrorResponse = await response.json()
      throw new Error(`Failed to get access token: ${error.error_description || error.message}`)
    }

    const tokens: ContaAzulTokens = await response.json()

    tokens.expires_at = Date.now() + tokens.expires_in * 1000

    await this.storeTokens(tokens)

    return tokens
  }

  async refreshAccessToken(refreshToken: string): Promise<ContaAzulTokens> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    })

    const response = await fetch(`${CONTA_AZUL_AUTH_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const error: ContaAzulErrorResponse = await response.json()
      throw new Error(`Failed to refresh token: ${error.error_description || error.message}`)
    }

    const tokens: ContaAzulTokens = await response.json()
    tokens.expires_at = Date.now() + tokens.expires_in * 1000

    await this.storeTokens(tokens)

    return tokens
  }

  async getValidAccessToken(): Promise<string> {
    const tokens = await this.getStoredTokens()

    if (!tokens) {
      throw new Error('No Conta Azul tokens found. Please authenticate first.')
    }

    const expiresAt = tokens.expires_at || 0
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000

    if (expiresAt - now < fiveMinutes) {
      const newTokens = await this.refreshAccessToken(tokens.refresh_token)
      return newTokens.access_token
    }

    return tokens.access_token
  }

  private async storeTokens(tokens: ContaAzulTokens): Promise<void> {
    const { storeContaAzulTokens } = await import('./contaazul-token.service')
    await storeContaAzulTokens(tokens, this.tenantId)
  }

  private async getStoredTokens(): Promise<ContaAzulTokens | null> {
    const { getContaAzulTokens } = await import('./contaazul-token.service')
    return await getContaAzulTokens(this.tenantId)
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const accessToken = await this.getValidAccessToken()
    const fullUrl = `${CONTA_AZUL_API_URL}${endpoint}`

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error: ContaAzulErrorResponse = await response.json().catch(() => ({}))
      logger.error('[API] Erro detalhado', undefined, {
        status: response.status,
        error,
        url: fullUrl,
      })
      throw new Error(`API Error (${response.status}): ${error.message || response.statusText}`)
    }

    if (response.status === 204) {
      return {} as T
    }

    return await response.json()
  }

  async getCustomers(): Promise<ContaAzulCustomer[]> {
    const allCustomers: ContaAzulCustomerRaw[] = []
    let currentPage = 1
    let hasMorePages = true

    do {
      const response = await this.request<{
        items?: ContaAzulCustomerRaw[]
        totalItems?: number
      }>(`/v1/pessoas?pagina=${currentPage}&tamanho_pagina=50&tipo_perfil=Cliente`)

      const pageCustomers = response.items || []

      if (pageCustomers.length === 0) {
        hasMorePages = false
        break
      }

      allCustomers.push(...pageCustomers)

      if (pageCustomers.length < 50) {
        hasMorePages = false
      } else {
        currentPage++
      }

      if (currentPage > 100) {
        hasMorePages = false
      }
    } while (hasMorePages)

    const clientCustomers = allCustomers.filter((customer) => {
      const perfis = customer.perfis || []
      return perfis.some((perfil) => perfil?.toLowerCase() === 'cliente' || perfil === 'CLIENTE')
    })

    const customers = clientCustomers.map(normalizeCustomer)

    return customers
  }

  async getCustomerById(id: string): Promise<ContaAzulCustomer> {
    return await this.request<ContaAzulCustomer>(`/v1/pessoas/${id}`)
  }

  async createCustomer(customer: ContaAzulCustomer): Promise<ContaAzulCustomer> {
    const created = await this.request<ContaAzulCustomer>('/v1/pessoas', {
      method: 'POST',
      body: JSON.stringify(customer),
    })
    return created
  }

  async updateCustomer(
    id: string,
    customer: Partial<ContaAzulCustomer>,
  ): Promise<ContaAzulCustomer> {
    const updated = await this.request<ContaAzulCustomer>(`/v1/pessoas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    })
    return updated
  }

  async findCustomerByDocument(document: string): Promise<ContaAzulCustomer | null> {
    try {
      const cleanDocument = document.replace(/[^\d]/g, '')

      logger.debug('[API] Buscando cliente por documento (nova API):', {
        documentoOriginal: document,
        documentoLimpo: cleanDocument,
      })

      const response = await this.request<{
        items?: ContaAzulCustomerRaw[]
        totalItems?: number
      }>(`/v1/pessoas?documentos=${encodeURIComponent(cleanDocument)}&tipo_perfil=Cliente`)

      logger.debug('[API] Resposta da busca por documento:', {
        items: response.items?.length || 0,
        totalItems: response.totalItems,
      })

      const rawCustomers = response.items || []

      if (rawCustomers.length > 0) {
        const customer = normalizeCustomer(rawCustomers[0])

        return customer
      }

      return null
    } catch {
      return null
    }
  }

  async getProducts(): Promise<ContaAzulProduct[]> {
    return this.request<ContaAzulProduct[]>('/product')
  }

  async createProduct(product: ContaAzulProduct): Promise<ContaAzulProduct> {
    return this.request<ContaAzulProduct>('/product', {
      method: 'POST',
      body: JSON.stringify(product),
    })
  }

  async getServices(): Promise<ContaAzulService[]> {
    logger.debug('[API] Buscando servicos cadastrados no Conta Azul')

    const collected: ContaAzulService[] = []
    let currentPage = 1
    let totalPages = 1

    do {
      const response = await this.request<ContaAzulServicesResponse | ContaAzulServicesResponse[]>(
        `/v1/servicos?pagina=${currentPage}&tamanho_pagina=100`,
      )

      const payload = Array.isArray(response) ? response[0] : response
      const itens = Array.isArray(payload?.itens) ? (payload?.itens ?? []) : []

      itens.forEach((item) => {
        const normalized = normalizeService(item)
        if (normalized) {
          collected.push(normalized)
        }
      })

      const pagination = payload?.paginacao ?? null
      if (pagination?.total_paginas) {
        totalPages = Number(pagination.total_paginas) || 1
      }

      currentPage += 1

      if (currentPage > 50) {
        logger.warn('[API] Interrompendo sincronizacao de servicos: muitas paginas retornadas', {
          tenantId: this.tenantId,
          pageLimit: 50,
        })
        break
      }
    } while (currentPage <= totalPages)

    return collected
  }

  async getProvidedServices(): Promise<ContaAzulService[]> {
    logger.debug('[API] Buscando servicos PRESTADOS no Conta Azul')

    const collected: ContaAzulService[] = []
    let currentPage = 1
    let totalPages = 1

    do {
      const response = await this.request<ContaAzulServicesResponse | ContaAzulServicesResponse[]>(
        `/v1/servicos?pagina=${currentPage}&tamanho_pagina=100`,
      )

      const payload = Array.isArray(response) ? response[0] : response
      const itens = Array.isArray(payload?.itens) ? (payload?.itens ?? []) : []

      itens.forEach((item) => {
        if (item.tipo_servico === 'PRESTADO') {
          const normalized = normalizeService(item)
          if (normalized) {
            collected.push(normalized)
          }
        }
      })

      const pagination = payload?.paginacao ?? null
      if (pagination?.total_paginas) {
        totalPages = Number(pagination.total_paginas) || 1
      }

      currentPage += 1

      if (currentPage > 50) {
        logger.warn('[API] Interrompendo sincronizacao de servicos: muitas paginas retornadas', {
          tenantId: this.tenantId,
          pageLimit: 50,
        })
        break
      }
    } while (currentPage <= totalPages)

    logger.info('[API] Servicos PRESTADOS retornados', {
      tenantId: this.tenantId,
      count: collected.length,
    })

    return collected
  }

  async createService(service: ContaAzulService): Promise<ContaAzulService> {
    return this.request<ContaAzulService>('/v1/servicos', {
      method: 'POST',
      body: JSON.stringify(service),
    })
  }

  async getServiceById(id: string): Promise<ContaAzulService> {
    return this.request<ContaAzulService>(`/v1/servicos/${id}`)
  }

  async updateService(id: string, service: Partial<ContaAzulService>): Promise<ContaAzulService> {
    return this.request<ContaAzulService>(`/v1/servicos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(service),
    })
  }

  async deleteService(id: string): Promise<void> {
    await this.request<void>(`/v1/servicos/${id}`, {
      method: 'DELETE',
    })
  }

  async createSale(sale: ContaAzulSale): Promise<ContaAzulCreateSaleResponse> {
    const total = sale.items.reduce(
      (sum, it) => sum + (it.total || it.unitPrice * it.quantity || 0),
      0,
    )

    const mappedItems = sale.items.map((it) => ({
      id: it.product?.id || it.service?.id,
      quantidade: it.quantity,
      valor: it.unitPrice,
      descricao: it.description,
    }))

    const situacao = sale.status === 'APPROVED' ? 'APROVADO' : 'EM_ANDAMENTO'
    const dataVenda = sale.saleDate.split('T')[0] // ensure YYYY-MM-DD
    const vencimento = (sale.paymentDueDate || sale.saleDate).split('T')[0]

    const condicaoPagamento = {
      tipo_pagamento: sale.paymentMethod || undefined,
      opcao_condicao_pagamento: sale.paymentCondition || 'À vista',
      parcelas: [
        {
          data_vencimento: vencimento,
          valor: Number(total.toFixed(2)),
          descricao: 'Parcela única',
        },
      ],
    }

    const payload = {
      id_cliente: sale.customer.id,
      numero: sale.number || undefined,
      situacao,
      data_venda: dataVenda,
      itens: mappedItems,
      condicao_pagamento: condicaoPagamento,
      observacoes: sale.invoiceNotes || undefined,
      observacoes_pagamento: sale.paymentNotes || undefined,
    }

    return this.request<ContaAzulCreateSaleResponse>('/v1/venda', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async getSaleById(id: string): Promise<ContaAzulSale> {
    return this.request<ContaAzulSale>(`/sale/${id}`)
  }

  async downloadSalePdf(saleId: string | number): Promise<Uint8Array> {
    const accessToken = await this.getValidAccessToken()
    const fullUrl = `${CONTA_AZUL_API_URL}/v1/venda/${saleId}/imprimir`

    const response = await fetch(fullUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/pdf',
      },
    })

    if (!response.ok) {
      let errorMessage = response.statusText

      try {
        const errorBody: ContaAzulErrorResponse = await response.json()
        errorMessage = errorBody.message || errorBody.error_description || errorMessage
      } catch {
        try {
          errorMessage = await response.text()
        } catch {
        }
      }

      logger.error('[API] Failed to download Conta Azul sale PDF', undefined, {
        status: response.status,
        saleId,
        url: fullUrl,
      })

      throw new Error(`Failed to download invoice PDF: ${errorMessage}`)
    }

    const buffer = await response.arrayBuffer()
    return new Uint8Array(buffer)
  }

  async getNextSaleNumber(): Promise<number> {
    const response = await this.request<number | null>('/v1/venda/proximo-numero')
    if (response === null || response === undefined) {
      throw new Error('Failed to get next sale number from Conta Azul')
    }
    return response
  }
}

export async function createContaAzulClient(tenantId: string): Promise<ContaAzulClient> {
  const clientId = process.env.NEXT_PUBLIC_CONTA_AZUL_CLIENT_ID
  const clientSecret = process.env.CONTA_AZUL_CLIENT_SECRET
  const redirectUri =
    process.env.NEXT_PUBLIC_CONTA_AZUL_REDIRECT_URI ||
    'https://sigelo.vercel.app/api/contaazul/callback'

  if (!clientId || !clientSecret) {
    throw new Error('Missing Conta Azul configuration. Check environment variables.')
  }

  return new ContaAzulClient({
    clientId,
    clientSecret,
    redirectUri,
    tenantId,
  })
}
