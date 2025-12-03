import type { OrderFulfillment, OrderFulfillmentItem } from '../model'
import { calculateOrderTotal } from '@/shared/lib/order-calculations'

export const getOrderNumber = (order: OrderFulfillment): string => order.number

export const getOrderItems = (order: OrderFulfillment): OrderFulfillmentItem[] =>
  order.new_order_items

export const getItemTotalPrice = (item: OrderFulfillmentItem): number => item.item_total

export const getItemDescription = (item: OrderFulfillmentItem): string => item.description

export const getItemDays = (item: OrderFulfillmentItem): number => item.days

export const calculateOrderSubtotal = (order: OrderFulfillment): number =>
  calculateOrderTotal(order.new_order_items)

export interface EquipmentTotals {
  stdItems: OrderFulfillmentItem[]
  pcdItems: OrderFulfillmentItem[]
  stdTotal: number
  pcdTotal: number
}

export function separateEquipmentTypes(items: OrderFulfillmentItem[]): EquipmentTotals {
  const stdItems = items.filter((item) => !item.description.toUpperCase().includes('PCD'))
  const pcdItems = items.filter((item) => item.description.toUpperCase().includes('PCD'))

  return {
    stdItems,
    pcdItems,
    stdTotal: stdItems.reduce((sum, item) => sum + item.quantity, 0),
    pcdTotal: pcdItems.reduce((sum, item) => sum + item.quantity, 0),
  }
}
