import type { ContaAzulPessoa } from '../model'
import { ContaAzulPersonType } from '../model'

export interface PersonProfileBadge {
  label: string
  color: string
}

export class ContaAzulPersonsFormatterService {
  getPersonTypeLabel(personType: ContaAzulPersonType | string | null): string {
    if (!personType) return '-'

    const labels: Record<string, string> = {
      [ContaAzulPersonType.NATURAL]: 'Pessoa Física',
      [ContaAzulPersonType.LEGAL]: 'Pessoa Jurídica',
      [ContaAzulPersonType.FOREIGN]: 'Pessoa Estrangeira',
    }

    const key = String(personType).toUpperCase()
    return labels[key] || '-'
  }

  getPersonProfileBadges(person: ContaAzulPessoa): PersonProfileBadge[] {
    const badges: PersonProfileBadge[] = []

    if (person.is_customer) {
      badges.push({
        label: 'Cliente',
        color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      })
    }

    if (person.is_supplier) {
      badges.push({
        label: 'Fornecedor',
        color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      })
    }

    if (person.is_accountant) {
      badges.push({
        label: 'Contador',
        color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      })
    }

    if (person.is_partner) {
      badges.push({
        label: 'Sócio',
        color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300',
      })
    }

    badges.push({
      label: person.active ? 'Ativo' : 'Inativo',
      color: person.active
        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    })

    return badges
  }

  formatPersonContact(person: ContaAzulPessoa): string {
    const phones = [person.business_phone, person.mobile_phone, person.home_phone].filter(Boolean)

    return phones[0] || '-'
  }

  formatPersonLocation(person: ContaAzulPessoa): string {
    if (person.city_name && person.state) {
      return `${person.city_name}/${person.state}`
    }
    return '-'
  }

  getPersonDisplayName(person: ContaAzulPessoa): string {
    return person.name || person.email || 'Nome não informado'
  }

  getPersonEmail(person: ContaAzulPessoa): string | null {
    return person.email || null
  }
}

export const contaAzulPersonsFormatterService = new ContaAzulPersonsFormatterService()
