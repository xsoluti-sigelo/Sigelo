'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getUserData, requireWritePermission } from '@/entities/user'
import { ROUTES } from '@/shared/config'
import { createActivityLog } from '@/features/logs'
import { uploadEventAttachments } from './upload-event-attachment'
import type { EventTypeValue } from '@/features/events/config/event-types'
import { logger } from '@/shared/lib/logger'

type EventType = EventTypeValue | null
type DayOfWeek = 'DOM' | 'SEG' | 'TER' | 'QUA' | 'QUI' | 'SEX' | 'SAB'

interface CleaningRule {
  type: 'daily' | 'weekly' | 'custom'
  daysOfWeek?: DayOfWeek[]
  time?: string
  preUse?: boolean
  postUse?: boolean
}

export interface CreateNewEventFullData {
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
  received_date?: string | null
  is_night_event?: boolean | null
  is_intermittent?: boolean | null

  mobilization_datetime?: string | null
  demobilization_datetime?: string | null
  pre_cleaning_datetime?: string | null
  post_cleaning_datetime?: string | null

  event_type?: EventType
  cleaning_rule?: CleaningRule | null

  client_id?: string

  people?: Array<{
    name: string
    role: 'producer' | 'coordinator'
    phone: string | null
    is_primary?: boolean
  }>

  orders?: Array<{
    number: string
    date: string
    total_value: number
    is_cancelled: boolean
    items: Array<{
      description: string
      quantity: number
      days: number
      unit_price: number
      item_total: number
      service_id?: string
    }>
  }>

  services?: string[]

  eventServices?: Array<{
    contaazul_service_id: string
    quantity: number
    unit_price: number
    daily_rate: number
    total_price: number
    notes?: string
    order_id?: string
  }>

  attachments?: Array<{
    fileName: string
    fileData: string
    fileType: string
    fileSize: number
  }>

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
}

export interface CreateNewEventFullResult {
  success: boolean
  eventId?: string
  error?: string
  errors?: Record<string, string[]>
}

export async function createNewEventFull(
  data: CreateNewEventFullData,
): Promise<CreateNewEventFullResult> {
  const supabase = await createClient()

  const { role, tenant_id } = await getUserData()
  requireWritePermission(role)

  try {
    const eventId = crypto.randomUUID()

    const insertPayload: Record<string, unknown> = {
      id: eventId,
      tenant_id,
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
      status: 'DRAFT',
      received_date: data.received_date || null,
      is_night_event: data.is_night_event || null,
      is_intermittent: data.is_intermittent || null,
      mobilization_datetime: data.mobilization_datetime || null,
      demobilization_datetime: data.demobilization_datetime || null,
      pre_cleaning_datetime: data.pre_cleaning_datetime || null,
      post_cleaning_datetime: data.post_cleaning_datetime || null,
      event_type: data.event_type || null,
      cleaning_rule: data.cleaning_rule || null,
      source: 'MANUAL',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { error: eventError } = await supabase.from('new_events').insert(insertPayload as never)

    if (eventError) {
      if (eventError.code === '23505') {
        if (eventError.message?.includes('events_number_year_unique')) {
          return {
            success: false,
            error: `Já existe um evento com o número ${data.number} no ano ${data.year}. Por favor, utilize outro número.`,
          }
        }
      }

      return {
        success: false,
        error: 'Erro ao criar evento. Por favor, tente novamente.',
      }
    }

    if (data.client_id) {
      await supabase.from('new_events_contaazul_pessoas').insert({
        tenant_id,
        event_id: eventId,
        pessoa_id: data.client_id,
      })
    }

    if (data.people && data.people.length > 0) {
      const peopleToInsert = data.people.map((person, index) => ({
        tenant_id,
        id: `${eventId}-person-${String(index + 1).padStart(3, '0')}`,
        event_id: eventId,
        name: person.name,
        role: person.role,
        phone: person.phone,
        is_primary: person.is_primary || false,
      }))

      const { error: peopleError } = await supabase.from('new_people').insert(peopleToInsert)

      if (peopleError) {
        logger.error('Erro ao salvar pessoas', { error: peopleError })
        return {
          success: false,
          error: 'Erro ao salvar pessoas vinculadas. Por favor, tente novamente.',
        }
      }
    }

    const isManualEvent = insertPayload.source === 'MANUAL'

    if (data.orders && data.orders.length > 0) {
      if (isManualEvent) {
        const virtualOrderId = crypto.randomUUID()
        const totalValue = data.orders.reduce((sum, order) => sum + (order.total_value || 0), 0)

        const orderNumber = `MANUAL-${virtualOrderId.slice(-8)}`

        const { error: orderError } = await supabase.from('new_orders').insert({
          id: virtualOrderId,
          tenant_id,
          event_id: eventId,
          number: orderNumber,
          date: data.date,
          total_value: totalValue,
          is_cancelled: false,
          status: 'active',
        })

        if (!orderError) {
          let itemCounter = 1
          for (const order of data.orders) {
            if (order.items && order.items.length > 0) {
              for (const item of order.items) {
                const itemId = `${virtualOrderId}-item-${String(itemCounter).padStart(3, '0')}`
                itemCounter++

                let serviceDescription = item.description || 'Serviço manual'
                if (item.service_id) {
                  const { data: serviceData } = await supabase
                    .from('contaazul_services')
                    .select('name')
                    .eq('id', item.service_id)
                    .single()

                  if (serviceData?.name) {
                    serviceDescription = serviceData.name
                  }
                }

                await supabase.from('new_order_items').insert({
                  id: itemId,
                  tenant_id,
                  order_id: virtualOrderId,
                  description: serviceDescription,
                  quantity: item.quantity,
                  days: item.days,
                  unit_price: item.unit_price,
                  item_total: item.item_total,
                })

                if (item.service_id) {
                  await supabase.from('new_order_items_contaazul_services').insert({
                    tenant_id,
                    order_item_id: itemId,
                    service_id: item.service_id,
                  })
                }
              }
            }
          }
        }
      } else {
        for (const order of data.orders) {
          const orderId = `${eventId}-order-${order.number}`

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

          if (!orderId) continue

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
              })

              if (item.service_id) {
                await supabase.from('new_order_items_contaazul_services').insert({
                  tenant_id,
                  order_item_id: itemId,
                  service_id: item.service_id,
                })
              }
            }
          }
        }
      }
    }

    if (data.services && data.services.length > 0) {
      const serviceLinks = data.services.map((service) => ({
        tenant_id,
        event_id: eventId,
        service_id: service,
      }))

      await supabase.from('new_events_contaazul_services').insert(serviceLinks)
    }

    if (data.locationData) {
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

    await createActivityLog({
      action_type: 'CREATE_EVENT',
      entity_type: 'event',
      entity_id: eventId,
      old_value: undefined,
      new_value: {
        event_number: data.number,
        event_name: data.name,
        status: 'DRAFT',
      },
      metadata: {
        event_number: data.number,
        source: 'MANUAL',
      },
    })

    if (data.attachments && data.attachments.length > 0) {
      await uploadEventAttachments(eventId, data.attachments)
    }

    revalidatePath(ROUTES.EVENTS)
    revalidatePath(ROUTES.EVENTS)

    return {
      success: true,
      eventId,
    }
  } catch {
    return {
      success: false,
      error: 'Erro ao criar evento',
    }
  }
}
