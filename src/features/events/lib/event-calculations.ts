import type { OrderFulfillment } from '../model'

export function calculateTotalEventValue(orderFulfillments: OrderFulfillment[]): number {
  return orderFulfillments
    .filter((of) => !of.is_cancelled)
    .reduce((sum, of) => {
      const ofTotal = of.new_order_items.reduce((itemSum, item) => {
        return itemSum + item.item_total
      }, 0)
      return sum + ofTotal
    }, 0)
}
