import { useState } from 'react'
import type { ContaAzulServiceRecord as ContaAzulService } from '@/features/integrations/contaazul'
import { calculateItemTotal, calculateOrderTotal } from '../lib/order-calculations'

const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `local-${Date.now()}-${Math.random().toString(16).slice(2)}`

export interface OrderItemDraft {
  id: string
  description: string
  quantity: number
  days: number
  unit_price: number
  item_total: number
  service_id?: string
}

export interface OrderDraft {
  id: string
  number: string
  date: string
  total_value: number
  is_cancelled: boolean
  items: OrderItemDraft[]
}

type OrderInput = Omit<OrderDraft, 'id' | 'items'> & {
  items: Array<Omit<OrderItemDraft, 'id'>>
}

interface UseOrderManagementProps {
  services: ContaAzulService[]
  initialOrders?: OrderDraft[]
}

export function useOrderManagement({ services, initialOrders = [] }: UseOrderManagementProps) {
  const [orders, setOrders] = useState<OrderDraft[]>(initialOrders)

  const createNewOrder = (): OrderDraft => ({
    id: createId(),
    number: '',
    date: new Date().toISOString().split('T')[0],
    total_value: 0,
    is_cancelled: false,
    items: [],
  })

  const createNewItem = (): OrderItemDraft => ({
    id: createId(),
    description: '',
    quantity: 1,
    days: 1,
    unit_price: 0,
    item_total: 0,
  })

  const recalculateOrder = (order: OrderDraft): OrderDraft => ({
    ...order,
    total_value: calculateOrderTotal(order.items),
  })

  const recalculateItem = (item: OrderItemDraft): OrderItemDraft => ({
    ...item,
    item_total: calculateItemTotal(item.quantity, item.days, item.unit_price),
  })

  const addOrder = () => {
    setOrders((prev) => [...prev, createNewOrder()])
  }

  const removeOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId))
  }

  const updateOrder = <K extends keyof Omit<OrderDraft, 'id' | 'items' | 'total_value'>>(
    orderId: string,
    field: K,
    value: OrderDraft[K],
  ) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, [field]: value } : order)),
    )
  }

  const addOrderItem = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? recalculateOrder({ ...order, items: [...order.items, createNewItem()] })
          : order,
      ),
    )
  }

  const removeOrderItem = (orderId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order
        const newItems = order.items.filter((item) => item.id !== itemId)
        return recalculateOrder({ ...order, items: newItems })
      }),
    )
  }

  const updateOrderItem = <
    K extends keyof Omit<OrderItemDraft, 'id' | 'item_total'>,
    V extends OrderItemDraft[K],
  >(
    orderId: string,
    itemId: string,
    field: K,
    value: V,
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order

        const newItems = order.items.map((item) => {
          if (item.id !== itemId) return item
          const nextItem = recalculateItem({ ...item, [field]: value })
          return nextItem
        })

        return recalculateOrder({ ...order, items: newItems })
      }),
    )
  }

  const updateOrderItemWithService = (orderId: string, itemId: string, serviceId: string) => {
    const service = services.find((s) => s.id === serviceId)
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order

        const newItems = order.items.map((item) => {
          if (item.id !== itemId) return item
          const nextItem = recalculateItem({
            ...item,
            service_id: serviceId || undefined,
            unit_price:
              typeof service?.rate === 'number' ? service.rate : item.unit_price,
          })
          return nextItem
        })

        return recalculateOrder({ ...order, items: newItems })
      }),
    )
  }

  const resetOrders = () => {
    setOrders([])
  }

  const getOrdersPayload = (): OrderInput[] =>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    orders.map(({ id: _orderId, items, ...order }) => ({
      ...order,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      items: items.map(({ id: _itemId, ...item }) => item),
    }))

  return {
    orders,
    addOrder,
    removeOrder,
    updateOrder,
    addOrderItem,
    removeOrderItem,
    updateOrderItem,
    updateOrderItemWithService,
    resetOrders,
    getOrdersPayload,
  }
}
