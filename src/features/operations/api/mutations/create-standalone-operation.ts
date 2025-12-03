'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { getUserData, requireWritePermission } from '@/entities/user'
import { createPlaceholderEvent } from '@/entities/event/api/create-placeholder-event'
import { revalidatePath } from 'next/cache'
import { AssignmentRole } from '@/shared/config/enums'
import { ROUTES } from '@/shared/config'
import {
  createStandaloneOperationSchema,
  type CreateStandaloneOperationInput,
} from '../../model/standalone-operation-schema'

export interface CreateStandaloneOperationResponse {
  success: boolean
  operationId?: string
  eventId?: string
  error?: string
  errors?: Record<string, string[]>
}

async function rollbackEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: string | null,
) {
  if (!eventId) return

  const { data: orders } = await supabase
    .from('new_orders')
    .select('id')
    .eq('event_id', eventId)

  if (orders && orders.length > 0) {
    const orderIds = orders.map((order) => order.id)

    const { data: orderItems } = await supabase
      .from('new_order_items')
      .select('id')
      .in('order_id', orderIds)

    if (orderItems && orderItems.length > 0) {
      const itemIds = orderItems.map((item) => item.id)
      await supabase.from('new_order_items_contaazul_services').delete().in('order_item_id', itemIds)
      await supabase.from('new_order_items').delete().in('id', itemIds)
    }

    await supabase.from('new_orders').delete().in('id', orderIds)
  }

  const { data: operations } = await supabase
    .from('new_operations')
    .select('id')
    .eq('event_id', eventId)

  if (operations && operations.length > 0) {
    const operationIds = operations.map((op) => op.id)
    await supabase.from('vehicle_assignments').delete().in('molide_operation_id', operationIds)
    await supabase.from('service_assignments').delete().in('molide_operation_id', operationIds)
    await supabase.from('new_operations').delete().in('id', operationIds)
  }

  await supabase.from('event_locations').delete().eq('event_id', eventId)
  await supabase.from('new_events').delete().eq('id', eventId)
}

export async function createStandaloneOperation(
  input: CreateStandaloneOperationInput,
): Promise<CreateStandaloneOperationResponse> {
  const supabase = await createClient()
  const { id: userId, tenant_id, role } = await getUserData()
  requireWritePermission(role)

  const result = createStandaloneOperationSchema.safeParse(input)

  if (!result.success) {
    return {
      success: false,
      error: 'Dados inválidos',
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const validatedData = result.data

  let createdEventId: string | null = null

  try {
    const { success, eventId, error } = await createPlaceholderEvent(validatedData.event)

    if (!success || !eventId) {
      return {
        success: false,
        error: error || 'Erro ao criar evento',
      }
    }

    createdEventId = eventId

    if (validatedData.orders && validatedData.orders.length > 0) {
      for (const order of validatedData.orders) {
        const orderId = crypto.randomUUID()

        const { error: orderError } = await supabase.from('new_orders').insert({
          id: orderId,
          tenant_id,
          event_id: eventId,
          number: order.number,
          date: order.date,
          total_value: order.total_value,
          is_cancelled: order.is_cancelled,
          status: order.is_cancelled ? 'cancelled' : 'active',
        } as never)

        if (orderError) {
          continue
        }

        if (order.items && order.items.length > 0) {
          for (let itemIndex = 0; itemIndex < order.items.length; itemIndex++) {
            const item = order.items[itemIndex]
            const itemId = `${orderId}-item-${String(itemIndex + 1).padStart(3, '0')}`

            await supabase.from('new_order_items').insert({
              id: itemId,
              tenant_id,
              order_id: orderId,
              description: item.description,
              quantity: item.quantity,
              days: item.days,
              unit_price: item.unit_price,
              item_total: item.item_total,
            } as never)

            if (item.service_id) {
              await supabase.from('new_order_items_contaazul_services').insert({
                tenant_id,
                order_item_id: itemId,
                service_id: item.service_id,
              } as never)
            }
          }
        }
      }
    }

    let driverName: string | null = null
    let vehiclePlate: string | null = null

    if (validatedData.assignments?.partyId) {
      const { data: party } = await supabase
        .from('parties')
        .select('display_name')
        .eq('id', validatedData.assignments.partyId)
        .single()

      driverName = party?.display_name || null
    }

    if (validatedData.assignments?.vehicleId) {
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('license_plate')
        .eq('id', validatedData.assignments.vehicleId)
        .single()

      vehiclePlate = vehicle?.license_plate || null
    }

    const operationId = crypto.randomUUID()

    const { error: createError } = await supabase.from('new_operations').insert({
      id: operationId,
      tenant_id,
      event_id: eventId,
      type: validatedData.operation.type,
      subtype: null,
      date: validatedData.operation.date,
      time: validatedData.operation.time,
      duration: null,
      vehicle_type: null,
      driver: driverName,
      vehicle: vehiclePlate,
      helper: null,
      notes: null,
      status: 'SCHEDULED',
    } as never)

    if (createError) {
      await rollbackEvent(supabase, createdEventId)
      return { success: false, error: 'Erro ao criar operação' }
    }

    if (validatedData.assignments?.vehicleId) {
      await supabase.from('vehicle_assignments').insert({
        id: crypto.randomUUID(),
        tenant_id,
        molide_operation_id: operationId,
        vehicle_id: validatedData.assignments.vehicleId,
        assigned_by: userId,
      } as never)
    }

    if (validatedData.assignments?.partyId) {
      await supabase.from('service_assignments').insert({
        id: crypto.randomUUID(),
        tenant_id,
        molide_operation_id: operationId,
        party_id: validatedData.assignments.partyId,
        assignment_role: AssignmentRole.DRIVER,
        assigned_by: userId,
      } as never)
    }

    revalidatePath(ROUTES.OPERATIONS)

    return {
      success: true,
      operationId,
      eventId,
    }
  } catch {
    if (createdEventId) {
      await rollbackEvent(supabase, createdEventId)
    }
    return { success: false, error: 'Erro inesperado ao criar operação' }
  }
}
