'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getUserData, requireWritePermission } from '@/entities/user'
import { ROUTES } from '@/shared/config'
import { createActivityLog } from '@/features/logs'
import type { JsonValue } from '@/entities/activity-log/model/types'
import { createEventChangeLogs, buildEventFieldChanges } from '@/entities/event-change-log'
import { uploadEventAttachments } from './upload-event-attachment'
import type { EventTypeValue } from '@/features/events/config/event-types'

export interface UpdateNewEventFullData {
  name: string
  number: string
  year: number
  date: string
  start_date?: string
  end_date?: string
  start_time: string
  end_time: string
  location: string
  contract: string | null
  status: string
  received_date?: string | null
  is_night_event?: boolean | null
  is_intermittent?: boolean | null
  event_type?: EventTypeValue | null
  cleaning_rule?: {
    type: 'daily' | 'weekly'
    daysOfWeek?: string[]
    time: string
  } | null
  mobilization_datetime?: string | null
  demobilization_datetime?: string | null
  pre_cleaning_datetime?: string | null
  post_cleaning_datetime?: string | null

  client_id?: string

  people?: Array<{
    id?: string
    name: string
    role: 'producer' | 'coordinator'
    phone: string | null
    is_primary?: boolean
  }>

  orders?: Array<{
    id?: string
    number: string
    date: string
    total_value: number
    is_cancelled: boolean
    items: Array<{
      id?: string
      description: string
      quantity: number
      days: number
      unit_price: number
      item_total: number
      service_id?: string
    }>
  }>

  services?: string[]

  locationData?: {
    raw_address: string
    street: string | null
    number: string | null
    complement: string | null
    neighborhood: string | null
    city: string | null
    state: string | null
    postal_code: string | null
  }

  attachments?: Array<{
    fileName: string
    fileData: string
    fileType: string
    fileSize: number
  }>
}

export interface UpdateNewEventFullResult {
  success: boolean
  eventId?: string
  error?: string
  errors?: Record<string, string[]>
}

export async function updateNewEventFull(
  eventId: string,
  data: UpdateNewEventFullData,
): Promise<UpdateNewEventFullResult> {
  const supabase = await createClient()

  const { id: userId, role, tenant_id } = await getUserData()
  requireWritePermission(role)

  try {
    const { data: currentEvent, error: fetchError } = await supabase
      .from('new_events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (fetchError || !currentEvent) {
      return {
        success: false,
        error: 'Evento não encontrado',
      }
    }

    const oldValues: Record<string, JsonValue> = {}
    const newValues: Record<string, JsonValue> = {}
    const changedFields: string[] = []

    const updatePayload: Record<string, unknown> = {
      name: data.name,
      number: data.number,
      year: data.year,
      date: data.date,
      start_date: data.start_date || data.date,
      end_date: data.end_date || data.date,
      start_time: data.start_time,
      end_time: data.end_time,
      location: data.location,
      contract: data.contract,
      status: data.status as
        | 'ACTIVE'
        | 'CANCELLED'
        | 'CONFIRMED'
        | 'RECEIVED'
        | 'VERIFIED'
        | 'SCHEDULED'
        | 'IN_PROGRESS'
        | 'COMPLETED'
        | 'BILLED'
        | 'INCOMPLETE'
        | 'DRAFT'
        | null
        | undefined,
      received_date: data.received_date || null,
      is_night_event: data.is_night_event || null,
      is_intermittent: data.is_intermittent || null,
      event_type: data.event_type || null,
      cleaning_rule: data.cleaning_rule || null,
      mobilization_datetime: data.mobilization_datetime || null,
      demobilization_datetime: data.demobilization_datetime || null,
      pre_cleaning_datetime: data.pre_cleaning_datetime || null,
      post_cleaning_datetime: data.post_cleaning_datetime || null,
      updated_at: new Date().toISOString(),
    }

    for (const [field, newValue] of Object.entries(updatePayload)) {
      const oldValue = currentEvent[field as keyof typeof currentEvent]
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        oldValues[field] = oldValue as JsonValue
        newValues[field] = newValue as JsonValue
        changedFields.push(field)
      }
    }

    const { error: eventError } = await supabase
      .from('new_events')
      .update(updatePayload)
      .eq('id', eventId)

    if (eventError) {
      return {
        success: false,
        error: 'Erro ao atualizar evento',
      }
    }

    if (data.client_id) {
      await supabase.from('new_events_contaazul_pessoas').delete().eq('event_id', eventId)

      await supabase.from('new_events_contaazul_pessoas').insert({
        tenant_id,
        event_id: eventId,
        pessoa_id: data.client_id,
      })
    }

    if (data.people) {
      const { data: existingPeople } = await supabase
        .from('new_people')
        .select('id')
        .eq('event_id', eventId)

      const existingIds = existingPeople?.map((p) => p.id) || []
      const providedIds = data.people.filter((p) => p.id).map((p) => p.id as string)

      const idsToDelete = existingIds.filter((id) => !providedIds.includes(id))
      if (idsToDelete.length > 0) {
        await supabase.from('new_people').delete().in('id', idsToDelete)
      }
      let personIndex = 0
      for (const person of data.people) {
        if (person.id) {
          await supabase
            .from('new_people')
            .update({
              name: person.name,
              role: person.role,
              phone: person.phone,
              is_primary: person.is_primary || false,
            })
            .eq('id', person.id)
        } else {
          const newPersonId = `${eventId}-person-${String(personIndex + 1).padStart(3, '0')}`
          await supabase.from('new_people').insert({
            tenant_id,
            id: newPersonId,
            event_id: eventId,
            name: person.name,
            role: person.role,
            phone: person.phone,
            is_primary: person.is_primary || false,
          })
        }
        personIndex++
      }
    }

    if (data.orders) {
      const { data: existingOrders } = await supabase
        .from('new_orders')
        .select('id')
        .eq('event_id', eventId)

      const existingOrderIds = existingOrders?.map((o) => o.id) || []
      const providedOrderIds = data.orders.filter((o) => o.id).map((o) => o.id as string)

      const orderIdsToDelete = existingOrderIds.filter((id) => !providedOrderIds.includes(id))
      if (orderIdsToDelete.length > 0) {
        await supabase.from('new_order_items').delete().in('order_id', orderIdsToDelete)
        await supabase
          .from('new_order_items_contaazul_services')
          .delete()
          .in(
            'order_item_id',
            orderIdsToDelete.map((id) => `${id}-%`),
          )
        await supabase.from('new_orders').delete().in('id', orderIdsToDelete)
      }

      for (const order of data.orders) {
        let orderId = order.id

        if (orderId) {
          await supabase
            .from('new_orders')
            .update({
              number: order.number,
              date: order.date,
              total_value: order.total_value,
              is_cancelled: order.is_cancelled,
            })
            .eq('id', orderId)
        } else {
          orderId = `${eventId}-order-${order.number}`

          await supabase.from('new_orders').insert({
            id: orderId,
            tenant_id,
            event_id: eventId,
            number: order.number,
            date: order.date,
            total_value: order.total_value,
            is_cancelled: order.is_cancelled,
            status: order.is_cancelled ? 'cancelled' : 'active',
          })
        }

        if (!orderId) continue

        const { data: existingItems } = await supabase
          .from('new_order_items')
          .select('id')
          .eq('order_id', orderId)

        const existingItemIds = existingItems?.map((i) => i.id) || []
        const providedItemIds = order.items.filter((i) => i.id).map((i) => i.id as string)

        const itemIdsToDelete = existingItemIds.filter((id) => !providedItemIds.includes(id))
        if (itemIdsToDelete.length > 0) {
          await supabase.from('new_order_items').delete().in('id', itemIdsToDelete)
          await supabase
            .from('new_order_items_contaazul_services')
            .delete()
            .in('order_item_id', itemIdsToDelete)
        }

        let itemIndex = 0
        for (const item of order.items) {
          let itemId = item.id

          if (itemId) {
            await supabase
              .from('new_order_items')
              .update({
                description: item.description,
                quantity: item.quantity,
                days: item.days,
                unit_price: item.unit_price,
                item_total: item.item_total,
              })
              .eq('id', itemId)
          } else {
            itemId = `${orderId}-item-${String(itemIndex + 1).padStart(3, '0')}`

            await supabase.from('new_order_items').insert({
              id: itemId,
              tenant_id,
              order_id: orderId,
              description: item.description,
              quantity: item.quantity,
              days: item.days,
              unit_price: item.unit_price,
              item_total: item.item_total,
            })
          }
          itemIndex++

          if (itemId && item.service_id) {
            await supabase
              .from('new_order_items_contaazul_services')
              .delete()
              .eq('order_item_id', itemId)

            await supabase.from('new_order_items_contaazul_services').insert({
              tenant_id,
              order_item_id: itemId,
              service_id: item.service_id,
            })
          } else if (itemId && !item.service_id) {
            await supabase
              .from('new_order_items_contaazul_services')
              .delete()
              .eq('order_item_id', itemId)
          }
        }
      }
    }

    if (data.services) {
      await supabase.from('new_events_contaazul_services').delete().eq('event_id', eventId)

      if (data.services.length > 0) {
        const serviceLinks = data.services.map((service) => ({
          tenant_id,
          event_id: eventId,
          service_id: service,
        }))

        await supabase.from('new_events_contaazul_services').insert(serviceLinks)
      }
    }

    if (data.locationData) {
      const { data: existingLocation } = await supabase
        .from('event_locations')
        .select('id')
        .eq('event_id', eventId)
        .eq('is_primary', true)
        .eq('location_role', 'VENUE')
        .single()

      if (existingLocation) {
        await supabase
          .from('event_locations')
          .update({
            raw_address: data.locationData.raw_address,
            street: data.locationData.street,
            number: data.locationData.number,
            complement: data.locationData.complement,
            neighborhood: data.locationData.neighborhood,
            city: data.locationData.city,
            state: data.locationData.state,
            postal_code: data.locationData.postal_code,
          })
          .eq('id', existingLocation.id)

      } else {
        const locationId = crypto.randomUUID()

        await supabase.from('event_locations').insert({
          id: locationId,
          tenant_id,
          event_id: eventId,
          raw_address: data.locationData.raw_address,
          street: data.locationData.street,
          number: data.locationData.number,
          complement: data.locationData.complement,
          neighborhood: data.locationData.neighborhood,
          city: data.locationData.city,
          state: data.locationData.state,
          postal_code: data.locationData.postal_code,
          is_primary: true,
          location_role: 'VENUE',
        })

      }
    }

    const trackedFields = changedFields.filter((field) => field !== 'updated_at')
    const nextEventState =
      trackedFields.length > 0
        ? ({ ...currentEvent, ...updatePayload } as typeof currentEvent)
        : null
    const fieldChanges =
      trackedFields.length > 0 && nextEventState
        ? buildEventFieldChanges(currentEvent, nextEventState, {
            fields: trackedFields,
          })
        : []

    if (fieldChanges.length > 0) {
      const actionType = fieldChanges.some((change) => change.field === 'status')
        ? 'STATUS_CHANGED'
        : 'UPDATED'

      const logResult = await createEventChangeLogs({
        eventId,
        tenantId: tenant_id,
        changedBy: userId,
        entity: 'EVENT',
        action: actionType,
        changes: fieldChanges,
        source: 'update-new-event-full',
        context: {
          reason: 'event_details_update',
        },
      })

      if (!logResult.success) {
      }
    }

    if (trackedFields.length > 0) {
      await createActivityLog({
        action_type: 'UPDATE_EVENT',
        entity_type: 'event',
        entity_id: eventId,
        old_value: oldValues,
        new_value: newValues,
        metadata: {
          event_number: data.number,
          fields_changed: trackedFields,
          has_status_change: trackedFields.includes('status'),
        },
      })
    }

    if (data.attachments && data.attachments.length > 0) {
      await uploadEventAttachments(eventId, data.attachments)
    }

    revalidatePath(ROUTES.EVENTS)
    revalidatePath(ROUTES.EVENTS)
    revalidatePath(`/eventos/${eventId}`)

    return {
      success: true,
      eventId,
    }
  } catch {
    return {
      success: false,
      error: 'Erro ao atualizar evento',
    }
  }
}
