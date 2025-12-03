import { z } from 'zod'

export const uuidSchema = z.string().uuid('ID inválido')

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export const searchSchema = z.object({
  query: z.string().optional(),
})

export type UUID = z.infer<typeof uuidSchema>
export type PaginationParams = z.infer<typeof paginationSchema>
export type SortParams = z.infer<typeof sortSchema>
export type SearchParams = z.infer<typeof searchSchema>

export function isValidCPF(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, '')

  if (numbers.length !== 11) return false
  if (/^(\d)\1{10}$/.test(numbers)) return false

  let sum = 0
  let remainder

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (11 - i)
  }

  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(numbers.substring(9, 10))) return false

  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (12 - i)
  }

  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(numbers.substring(10, 11))) return false

  return true
}

export function isValidCNPJ(cnpj: string): boolean {
  const numbers = cnpj.replace(/\D/g, '')

  if (numbers.length !== 14) return false
  if (/^(\d)\1{13}$/.test(numbers)) return false

  let size = numbers.length - 2
  let nums = numbers.substring(0, size)
  const digits = numbers.substring(size)
  let sum = 0
  let pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += parseInt(nums.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) return false

  size = size + 1
  nums = numbers.substring(0, size)
  sum = 0
  pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += parseInt(nums.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(1))) return false

  return true
}

export function isValidPhone(phone: string): boolean {
  const numbers = phone.replace(/\D/g, '')
  return numbers.length === 10 || numbers.length === 11
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function removeNonNumeric(value: string): string {
  if (!value) return ''
  return value.replace(/\D/g, '')
}
