export const SPTURIS_CUSTOMER_NAME = 'SPTURIS'

export const PRODUCT_IDS = {
  BANHEIRO_PADRAO: process.env.CONTA_AZUL_PRODUCT_BANHEIRO_PADRAO_ID,
  BANHEIRO_PCD: process.env.CONTA_AZUL_PRODUCT_BANHEIRO_PCD_ID,
} as const

export const DEFAULT_CATEGORY = 'Receitas de Locação'
export const DEFAULT_COST_CENTER = 'RECEITA - LOCAÇÃO DE BANHEIROS QUÍMICOS'
export const DEFAULT_SELLER = 'LOGISTICA'
export const DEFAULT_PAYMENT_METHOD = 'TRANSFERENCIA_BANCARIA'
export const DEFAULT_RECEIVING_ACCOUNT = 'BANCO INTER (SALVA-RIO)'
export const DEFAULT_SERVICE_LOCATION = 'São Paulo (SP)'

export const PAYMENT_INFO_LINES: string[] = [
  '---',
  'Forma de Pagamento',
  'Banco: 077 - Banco Inter S.A.',
  'Agência: 0001',
  'Conta Corrente: 43279227-9',
  'CNPJ: 57.677.267/0001-35',
  'Razão Social: Salva-Rio Ltda',
  '---',
]
