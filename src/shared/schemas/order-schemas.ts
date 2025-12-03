import { z } from 'zod'

export const orderItemSchema = z.object({
  description: z.string().optional(),
  quantity: z.number().positive('Quantidade deve ser maior que zero'),
  days: z.number().positive('Dias deve ser maior que zero'),
  unit_price: z.number().min(0, 'Preço unitário inválido'),
  item_total: z.number().min(0, 'Total inválido'),
  service_id: z.string().optional().nullable(),
})

export const orderItemStrictSchema = orderItemSchema.extend({
  description: z.string().min(1, 'Descrição é obrigatória'),
  quantity: z.number().int().min(1, 'Quantidade deve ser maior que 0'),
  days: z.number().int().min(1, 'Dias deve ser maior que 0'),
  service_id: z.string().uuid().optional(),
})

export const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Adicione pelo menos um item'),
})

export const orderWithNumberSchema = z.object({
  number: z.string().min(1, 'Número da O.F. é obrigatório'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  total_value: z.number().min(0, 'Valor total não pode ser negativo'),
  is_cancelled: z.boolean().optional().default(false),
  items: z.array(orderItemStrictSchema).min(1, 'A O.F. deve ter pelo menos 1 item'),
})

export type OrderItem = z.infer<typeof orderItemSchema>
export type OrderItemStrict = z.infer<typeof orderItemStrictSchema>
export type Order = z.infer<typeof orderSchema>
export type OrderWithNumber = z.infer<typeof orderWithNumberSchema>
