export interface OrderFulfillmentItem {
  id: string
  description: string
  quantity: number
  days: number
  unit_price: number
  item_total: number
  new_order_items_contaazul_services?: Array<{
    contaazul_services: {
      id: string
      name: string
      rate: number
    } | null
  }> | null
}

export interface OrderFulfillment {
  id: string
  number: string
  is_cancelled: boolean | null
  created_at: string | null
  new_order_items: OrderFulfillmentItem[]
}
