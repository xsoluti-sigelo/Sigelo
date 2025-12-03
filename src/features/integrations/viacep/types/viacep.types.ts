export interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge?: string
  gia?: string
  ddd?: string
  siafi?: string
  erro?: boolean
}

export interface AddressData {
  street: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  complement?: string
}

export interface ViaCepError {
  type: 'INVALID_CEP' | 'NOT_FOUND' | 'TIMEOUT' | 'NETWORK_ERROR' | 'UNKNOWN'
  message: string
  originalError?: Error
}
