export const VEHICLE_FIELD_LIMITS = {
  LICENSE_PLATE: {
    MIN: 7,
    MAX: 7,
  },
  BRAND: {
    MAX: 100,
  },
  MODEL: {
    MAX: 100,
  },
  YEAR: {
    MIN: 1900,
    MAX: new Date().getFullYear() + 1,
  },
  MODULE_CAPACITY: {
    MIN: 1,
    MAX: 1000,
  },
  COBLI_NUMBER: {
    MAX: 50,
  },
  FUEL_CONSUMPTION: {
    MIN: 0,
    MAX: 99.99,
  },
  SPEED_LIMIT: {
    MIN: 0,
    MAX: 200,
  },
  NOTES: {
    MAX: 1000,
  },
} as const

export const FUEL_TYPES = [
  { value: '', label: 'Selecione...' },
  { value: 'GASOLINE', label: 'Gasolina' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'FLEX', label: 'Flex' },
  { value: 'ELECTRIC', label: 'Elétrico' },
  { value: 'HYBRID', label: 'Híbrido' },
  { value: 'CNG', label: 'GNV' },
  { value: 'ETHANOL', label: 'Etanol' },
] as const

export const FUEL_TYPE_LABELS: Record<string, string> = {
  GASOLINE: 'Gasolina',
  DIESEL: 'Diesel',
  FLEX: 'Flex',
  ELECTRIC: 'Elétrico',
  HYBRID: 'Híbrido',
  CNG: 'GNV',
  ETHANOL: 'Etanol',
} as const

export const SIZE_CATEGORIES = [
  { value: '', label: 'Selecione...' },
  { value: 'SMALL', label: 'Pequeno' },
  { value: 'MEDIUM', label: 'Médio' },
  { value: 'LARGE', label: 'Grande' },
  { value: 'EXTRA_LARGE', label: 'Extra Grande' },
] as const

export const SIZE_CATEGORY_LABELS: Record<string, string> = {
  SMALL: 'Pequeno',
  MEDIUM: 'Médio',
  LARGE: 'Grande',
  EXTRA_LARGE: 'Extra Grande',
} as const
