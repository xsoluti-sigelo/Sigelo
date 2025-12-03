export const costFilterLabels: Record<string, string> = {
  with: 'Com custo',
  without: 'Sem custo',
  missing: 'Custo em branco',
}

export const priceFilterLabels: Record<string, string> = {
  with: 'Com preço',
  without: 'Sem preço',
  missing: 'Preço em branco',
}

export const costFilterOptions = [
  { value: '', label: 'Todos os custos' },
  { value: 'with', label: 'Com custo' },
  { value: 'without', label: 'Sem custo (<= 0)' },
  { value: 'missing', label: 'Custo em branco' },
]

export const priceFilterOptions = [
  { value: '', label: 'Todos os preços' },
  { value: 'with', label: 'Com preço' },
  { value: 'without', label: 'Sem preço (<= 0)' },
  { value: 'missing', label: 'Preço em branco' },
]

export function getCostFilterLabel(value: string): string {
  return costFilterLabels[value] || value
}

export function getPriceFilterLabel(value: string): string {
  return priceFilterLabels[value] || value
}
