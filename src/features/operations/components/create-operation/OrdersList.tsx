import { Button, Input } from '@/shared/ui'
import type { OrderDraft, OrderItemDraft } from '@/features/operations/hooks/useOrderManagement'
import type { ContaAzulServiceRecord as ContaAzulService } from '@/features/integrations/contaazul'

interface OrdersListProps {
  orders: OrderDraft[]
  services: ContaAzulService[]
  onAddOrder: () => void
  onRemoveOrder: (orderId: string) => void
  onUpdateOrder: <K extends keyof Omit<OrderDraft, 'id' | 'items' | 'total_value'>>(
    orderId: string,
    field: K,
    value: OrderDraft[K],
  ) => void
  onAddOrderItem: (orderId: string) => void
  onRemoveOrderItem: (orderId: string, itemId: string) => void
  onUpdateOrderItem: <K extends keyof Omit<OrderItemDraft, 'id' | 'item_total'>>(
    orderId: string,
    itemId: string,
    field: K,
    value: OrderItemDraft[K],
  ) => void
  onUpdateOrderItemWithService: (
    orderId: string,
    itemId: string,
    serviceId: string,
  ) => void
}

export function OrdersList({
  orders,
  services,
  onAddOrder,
  onRemoveOrder,
  onUpdateOrder,
  onAddOrderItem,
  onRemoveOrderItem,
  onUpdateOrderItem,
  onUpdateOrderItemWithService,
}: OrdersListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-200 dark:border-gray-800">
          Nossos Serviços
        </h3>
        <Button type="button" size="sm" onClick={onAddOrder}>
          + Novo Serviço
        </Button>
      </div>

      <div className="space-y-6">
        {orders.map((order, orderIndex) => (
          <div
            key={order.id}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Serviço #{orderIndex + 1}
              </h4>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => onRemoveOrder(order.id)}
              >
                Remover Serviço
              </Button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número do Serviço *
              </label>
              <Input
                value={order.number}
                onChange={(e) => onUpdateOrder(order.id, 'number', e.target.value)}
                required
                placeholder="Ex: OF-12345"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Itens do Serviço
                </h5>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => onAddOrderItem(order.id)}
                >
                  + Item
                </Button>
              </div>

              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 space-y-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Descrição *
                      </label>
                      <Input
                        placeholder="Descrição"
                        value={item.description}
                        onChange={(e) =>
                          onUpdateOrderItem(order.id, item.id, 'description', e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Quantidade *
                      </label>
                      <Input
                        type="number"
                        placeholder="Qtd"
                        value={item.quantity}
                        onChange={(e) =>
                          onUpdateOrderItem(order.id, item.id, 'quantity', Number(e.target.value))
                        }
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Dias *
                      </label>
                      <Input
                        type="number"
                        placeholder="Dias"
                        value={item.days}
                        onChange={(e) =>
                          onUpdateOrderItem(order.id, item.id, 'days', Number(e.target.value))
                        }
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Preço unitário *
                      </label>
                      <Input
                        type="number"
                        placeholder="Preço"
                        value={item.unit_price}
                        onChange={(e) =>
                          onUpdateOrderItem(order.id, item.id, 'unit_price', Number(e.target.value))
                        }
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Total
                        </label>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          R$ {item.item_total.toFixed(2)}
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => onRemoveOrderItem(order.id, item.id)}
                      >
                        ×
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Serviço do Conta Azul
                    </label>
                    <select
                      value={item.service_id || ''}
                      onChange={(e) =>
                        onUpdateOrderItemWithService(order.id, item.id, e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Nenhum serviço selecionado</option>
                      {services.map((servico) => (
                        <option key={servico.id} value={servico.id}>
                          {servico.name} {servico.rate ? `- R$ ${servico.rate.toFixed(2)}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

              {order.items.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-2 text-sm">
                  Nenhum item no Serviço
                </p>
              )}

              <div className="text-right pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total do Serviço:{' '}
                  <span className="text-lg text-gray-900 dark:text-white">
                    R$ {order.total_value.toFixed(2)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            Nenhum serviço cadastrado. Adicione serviços conforme necessário.
          </p>
        )}
      </div>
    </div>
  )
}
