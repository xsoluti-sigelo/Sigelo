'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { createEventSchema } from '@/shared'
import { revalidatePath } from 'next/cache'
import { getUserData, requireWritePermission } from '@/entities/user'
import { ROUTES } from '@/shared/config'
import { createActivityLog } from '@/features/logs'
import type { JsonValue } from '@/entities/activity-log/model/types'
import type {
  UpdateEventResult,
  UpdateEventResponse,
  UpdateEventErrorResponse,
} from '@/entities/event/api/types'

export async function updateEvent(eventId: string, formData: unknown): Promise<UpdateEventResult> {
  const supabase = await createClient()

  const { id: userId, tenant_id: tenantId, role } = await getUserData()
  requireWritePermission(role)

  const result = createEventSchema.safeParse(formData)
  if (!result.success) {
    const errorResponse: UpdateEventErrorResponse = {
      success: false,
      error: 'Dados inválidos',
      errors: result.error.flatten().fieldErrors,
    }
    return errorResponse
  }

  const data = result.data

  try {
    const { data: currentEvent, error: fetchError } = await supabase
      .from('new_events')
      .select('*')
      .eq('id', eventId)
      .eq('tenant_id', tenantId)
      .single()

    if (fetchError || !currentEvent) {
      const errorResponse: UpdateEventErrorResponse = {
        success: false,
        error: 'Evento não encontrado',
      }
      return errorResponse
    }

    const startDatetime =
      data.event_date && data.start_time
        ? `${data.event_date}T${data.start_time}:00Z`
        : data.event_date
          ? `${data.event_date}T00:00:00Z`
          : new Date().toISOString()

    const endDatetime =
      data.end_date && data.end_time
        ? `${data.end_date}T${data.end_time}:00Z`
        : data.end_date
          ? `${data.end_date}T23:59:59Z`
          : null

    const eventTypeMapping: Record<string, string> = {
      unique: 'UNICO',
      recurring: 'INTERMITENTE',
      continuous: 'CONTINUO',
    }

    const mappedEventType = data.event_type
      ? (eventTypeMapping[data.event_type] as 'UNICO' | 'INTERMITENTE') || null
      : null

    const updatePayload = {
      client_id: data.client_id ?? null,
      title: data.title,
      description: data.event_description,
      contract_number: data.contract_number || null,
      start_datetime: startDatetime,
      end_datetime: endDatetime,
      event_type: mappedEventType,
      status: data.status || 'DRAFT',
      general_observations: data.general_observations || null,
      logistics_notes: data.logistics_notes || null,
      billing_notes: data.billing_notes || null,
      updated_at: new Date().toISOString(),
      updated_by: userId,
    }

    const oldValues: Record<string, JsonValue> = {}
    const newValues: Record<string, JsonValue> = {}
    const changedFields: string[] = []

    const fieldMapping: Record<string, keyof typeof updatePayload> = {
      client_id: 'client_id',
      title: 'title',
      description: 'description',
      contract_number: 'contract_number',
      start_datetime: 'start_datetime',
      end_datetime: 'end_datetime',
      event_type: 'event_type',
      status: 'status',
      general_observations: 'general_observations',
      logistics_notes: 'logistics_notes',
      billing_notes: 'billing_notes',
    }

    for (const [displayField, payloadField] of Object.entries(fieldMapping)) {
      const oldValue = currentEvent[payloadField as keyof typeof currentEvent]
      const newValue = updatePayload[payloadField]

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        oldValues[displayField] = oldValue as JsonValue
        newValues[displayField] = newValue as JsonValue
        changedFields.push(displayField)
      }
    }

    const { error: eventError } = await supabase
      .from('new_events')
      .update(updatePayload)
      .eq('id', eventId)
      .eq('tenant_id', tenantId)

    if (eventError) {
      const errorResponse: UpdateEventErrorResponse = {
        success: false,
        error: 'Erro ao atualizar evento',
      }
      return errorResponse
    }

    if (changedFields.length > 0) {
      await createActivityLog({
        action_type: 'UPDATE_EVENT',
        entity_type: 'event',
        entity_id: eventId,
        old_value: oldValues,
        new_value: newValues,
        metadata: {
          event_number: currentEvent.number,
          fields_changed: changedFields,
          has_status_change: changedFields.includes('status'),
        },
      })
    }

    let locationUpdated = false
    if (data.location?.raw_address) {
      const { data: existingLocation } = await supabase
        .from('event_locations')
        .select('id')
        .eq('event_id', eventId)
        .eq('tenant_id', tenantId)
        .limit(1)
        .maybeSingle()

      if (existingLocation) {
        await supabase
          .from('event_locations')
          .update({
            raw_address: data.location.raw_address,
            street: data.location.street || null,
            number: data.location.number || null,
            complement: data.location.complement || null,
            neighborhood: data.location.neighborhood || null,
            city: data.location.city || null,
            state: data.location.state || null,
            postal_code: data.location.postal_code || null,
          })
          .eq('id', existingLocation.id)
      } else {
        await supabase.from('event_locations').insert({
          tenant_id: tenantId,
          event_id: eventId,
          raw_address: data.location.raw_address,
          street: data.location.street || null,
          number: data.location.number || null,
          complement: data.location.complement || null,
          neighborhood: data.location.neighborhood || null,
          city: data.location.city || null,
          state: data.location.state || null,
          postal_code: data.location.postal_code || null,
        })
      }
      locationUpdated = true
    }

    if (changedFields.length === 0 && locationUpdated) {
      await createActivityLog({
        action_type: 'UPDATE_EVENT',
        entity_type: 'event',
        entity_id: eventId,
        new_value: {
          location_updated: locationUpdated as unknown as JsonValue,
        },
        metadata: {
          event_number: (currentEvent as never)['event_number'],
        },
      })
    }

    revalidatePath(ROUTES.EVENTS)
    revalidatePath(ROUTES.EVENTS)
    revalidatePath(`/eventos/${eventId}`)

    const successResponse: UpdateEventResponse = {
      success: true,
      eventId,
    }
    return successResponse
  } catch {
    const errorResponse: UpdateEventErrorResponse = {
      success: false,
      error: 'Erro ao atualizar evento',
    }
    return errorResponse
  }
}
