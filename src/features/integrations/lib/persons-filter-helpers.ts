import { ContaAzulPersonType, ContaAzulPersonProfile } from '@/features/integrations/contaazul'

export const personTypeLabels: Record<string, string> = {
  [ContaAzulPersonType.NATURAL]: 'Pessoa Física',
  [ContaAzulPersonType.LEGAL]: 'Pessoa Jurídica',
  [ContaAzulPersonType.FOREIGN]: 'Pessoa Estrangeira',
}

export const profileLabels: Record<string, string> = {
  [ContaAzulPersonProfile.CUSTOMER]: 'Cliente',
  [ContaAzulPersonProfile.SUPPLIER]: 'Fornecedor',
  [ContaAzulPersonProfile.ACCOUNTANT]: 'Contador',
  [ContaAzulPersonProfile.PARTNER]: 'Sócio',
}

export const activeStatusLabels: Record<string, string> = {
  true: 'Ativo',
  false: 'Inativo',
}

export const personTypeOptions = [
  { value: '', label: 'Todos os tipos' },
  { value: ContaAzulPersonType.NATURAL, label: 'Pessoa Física' },
  { value: ContaAzulPersonType.LEGAL, label: 'Pessoa Jurídica' },
  { value: ContaAzulPersonType.FOREIGN, label: 'Pessoa Estrangeira' },
]

export const profileOptions = [
  { value: '', label: 'Todos os perfis' },
  { value: ContaAzulPersonProfile.CUSTOMER, label: 'Cliente' },
  { value: ContaAzulPersonProfile.SUPPLIER, label: 'Fornecedor' },
  { value: ContaAzulPersonProfile.ACCOUNTANT, label: 'Contador' },
  { value: ContaAzulPersonProfile.PARTNER, label: 'Sócio' },
]

export const activeStatusOptions = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Ativo' },
  { value: 'false', label: 'Inativo' },
]

export function getPersonTypeLabel(value: string): string {
  return personTypeLabels[value] || value
}

export function getProfileLabel(value: string): string {
  return profileLabels[value] || value
}

export function getActiveStatusLabel(value: string): string {
  return activeStatusLabels[value] || value
}
