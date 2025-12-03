import type { ContaAzulPessoa } from '@/features/integrations/contaazul'
import { formatCPFCNPJ, formatPhone } from '@/shared/lib/formatters'
import { contaAzulPersonsFormatterService } from '../contaazul/services/contaazul-persons-formatter.service'

export interface FormattedPerson {
  id: string
  displayName: string
  email: string | null
  document: string
  personType: string
  profileBadges: Array<{
    label: string
    color: string
  }>
  contact: string
  location: string
  active: boolean
}

export function formatPersonsForTable(persons: ContaAzulPessoa[]): FormattedPerson[] {
  return persons.map((person) => ({
    id: person.id,
    displayName: contaAzulPersonsFormatterService.getPersonDisplayName(person),
    email: contaAzulPersonsFormatterService.getPersonEmail(person),
    document: formatCPFCNPJ(person.cpf || person.cnpj),
    personType: contaAzulPersonsFormatterService.getPersonTypeLabel(person.person_type || ''),
    profileBadges: contaAzulPersonsFormatterService.getPersonProfileBadges(person),
    contact: formatPhone(contaAzulPersonsFormatterService.formatPersonContact(person)),
    location: contaAzulPersonsFormatterService.formatPersonLocation(person),
    active: person.active,
  }))
}
