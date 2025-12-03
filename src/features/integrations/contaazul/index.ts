export { ContaAzulClient, createContaAzulClient } from './services/contaazul-client.service'
export { getValidContaAzulAccessToken } from './services/contaazul-token.service'
export { checkCancellationEmails } from './lib/cancellation-checker'

export type {
  ContaAzulTokens,
  ContaAzulCustomer,
  ContaAzulCustomerRaw,
  ContaAzulProduct,
  ContaAzulService,
  ContaAzulServiceRaw,
  ContaAzulServicesResponse,
  ContaAzulSale,
  ContaAzulSaleItem,
  ContaAzulErrorResponse,
  ContaAzulCreateSaleResponse,
} from './types/contaazul.types'

export { ContaAzulPersonType, ContaAzulPersonProfile } from './model'
export type {
  ContaAzulServiceRecord,
  SyncServicesResult,
  ContaAzulPessoa,
  ContaAzulPessoaListItem,
  ContaAzulPessoaCreate,
  ContaAzulPessoaUpdate,
} from './model'
