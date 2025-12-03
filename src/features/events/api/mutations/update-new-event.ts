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

export async function updateNewEvent(
  eventId: string,
  formData: unknown,
): Promise<UpdateEventResult> {
  const supabase = await createClient()

  const { role, tenant_id } = await getUserData()
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
      .single()

    if (fetchError || !currentEvent) {
      const errorResponse: UpdateEventErrorResponse = {
        success: false,
        error: 'Evento não encontrado',
      }
      return errorResponse
    }

    const eventDate = data.event_date || currentEvent.date
    const startTime = data.start_time
      ? `${data.start_time}:00`
      : currentEvent.start_time || '00:00:00'
    const endTime = data.end_time ? `${data.end_time}:00` : currentEvent.end_time

    const oldValues: Record<string, JsonValue> = {}
    const newValues: Record<string, JsonValue> = {}
    const changedFields: string[] = []

    const updatePayload = {
      name: data.title || currentEvent.name,
      contract: data.contract_number || currentEvent.contract || null,
      date: eventDate,
      start_time: startTime,
      end_time: endTime,
      location: data.location?.raw_address || currentEvent.location || null,
      is_intermittent: false,
      status: data.status || currentEvent.status || 'DRAFT',
      updated_at: new Date().toISOString(),
    }

    const fieldMapping: Record<string, keyof typeof updatePayload> = {
      name: 'name',
      contract: 'contract',
      date: 'date',
      start_time: 'start_time',
      end_time: 'end_time',
      location: 'location',
      is_intermittent: 'is_intermittent',
      status: 'status',
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

    if (eventError) {
      const errorResponse: UpdateEventErrorResponse = {
        success: false,
        error: 'Erro ao atualizar evento',
      }
      return errorResponse
    }

    if (data.client_id) {
      await supabase.from('new_events_contaazul_pessoas').delete().eq('event_id', eventId)

      await supabase.from('new_events_contaazul_pessoas').insert({
        tenant_id,
        event_id: eventId,
        pessoa_id: data.client_id,
      })
    }

    if (data.services && data.services.length > 0) {
      await supabase.from('new_events_contaazul_services').delete().eq('event_id', eventId)

      const serviceLinks = data.services.map((service) => ({
        tenant_id,
        event_id: eventId,
        service_id: service.contaazul_service_id,
      }))

      await supabase.from('new_events_contaazul_services').insert(serviceLinks)
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
