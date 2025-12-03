export const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 11)

  return numbers
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

export const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 14)

  return numbers
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export const formatCPFCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '')

  if (numbers.length <= 11) {
    return formatCPF(value)
  }

  return formatCNPJ(value)
}

export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 11)

  if (numbers.length === 0) return ''

  if (numbers.length === 11) {
    return numbers.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{1})(\d{4})(\d{4})$/, '$1 $2-$3')
  }

  if (numbers.length === 10) {
    return numbers.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d{4})$/, '$1-$2')
  }

  if (numbers.length > 2) {
    return numbers.replace(/^(\d{2})(\d)/, '($1) $2')
  }

  return numbers
}

export const formatStateRegistration = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 15)
  return numbers
}

export const formatWhatsApp = (value: string): string => {
  return formatPhone(value)
}

export const formatCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 8)

  return numbers.replace(/^(\d{5})(\d)/, '$1-$2')
}

export { isValidCPF as validateCPF, isValidCNPJ as validateCNPJ } from './validations/common'
