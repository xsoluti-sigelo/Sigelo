export { formatFileSize } from './formatters/fileSize'

export {
  formatDate,
  formatDateTime,
  formatTime,
  formatDateForInput,
  formatTimeForInput,
  formatDateToBR,
  formatDateOnly,
  formatTimeOnly,
  getRelativeTime,
  isToday,
  isExpired,
} from './date-utils'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatCPFCNPJ(value: string | null | undefined): string {
  if (!value) return '-'

  const numbers = value.replace(/\D/g, '')

  if (numbers.length === 11) {
    return numbers.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
  }

  if (numbers.length === 14) {
    return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  }

  return value
}

export function formatPhone(value: string | null | undefined): string {
  if (!value) return '-'

  const numbers = value.replace(/\D/g, '')

  if (numbers.length === 11) {
    return numbers.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  }

  if (numbers.length === 10) {
    return numbers.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
  }

  return value
}

export function formatCEP(value: string | null | undefined): string {
  if (!value) return '-'

  const numbers = value.replace(/\D/g, '')

  if (numbers.length === 8) {
    return numbers.replace(/^(\d{5})(\d{3})$/, '$1-$2')
  }

  return value
}
