export function calculateItemTotal(quantity: number, days: number, unitPrice: number): number {
  return (quantity || 0) * (days || 0) * (unitPrice || 0)
}

export function calculateOrderTotal<T extends { item_total: number }>(items: T[]): number {
  return items.reduce((sum, item) => sum + item.item_total, 0)
}
