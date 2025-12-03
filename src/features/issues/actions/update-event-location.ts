'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logger } from '@/shared/lib/logger'
import { ROUTES } from '@/shared/config'

export interface UpdateEventLocationInput {
  issueId: string
  eventId: string
  locationData: {
    raw_address: string
    street: string
    number: string | null
    complement: string | null
    neighborhood: string | null
    city: string
    state: string
    postal_code: string
  }
  autoResolve?: boolean
}

export interface UpdateEventLocationResult {
  success: boolean
  message?: string
  error?: string
}

export async function updateEventLocation({
  issueId,
  eventId,
  locationData,
  autoResolve = true,
}: UpdateEventLocationInput): Promise<UpdateEventLocationResult> {
  try {
    const supabase = await createClient()

    const { data: event, error: fetchEventError } = await supabase
      .from('new_events')
      .select('tenant_id')
      .eq('id', eventId)
      .single()

    if (fetchEventError || !event) {
      return { success: false, error: 'Evento não encontrado' }
    }

    const { error: updateEventError } = await supabase
      .from('new_events')
      .update({ location: locationData.raw_address })
      .eq('id', eventId)

    if (updateEventError) {
      logger.error('Error updating event location field', updateEventError, { eventId })
      return { success: false, error: 'Erro ao atualizar endereço do evento' }
    }

    const { data: existingLocation } = await supabase
      .from('event_locations')
      .select('id')
      .eq('event_id', eventId)
      .eq('is_primary', true)
      .eq('location_role', 'VENUE')
      .maybeSingle()

    if (existingLocation) {
      const { error: updateLocationError } = await supabase
        .from('event_locations')
        .update({
          raw_address: locationData.raw_address,
          street: locationData.street,
          number: locationData.number,
          complement: locationData.complement,
          neighborhood: locationData.neighborhood,
          city: locationData.city,
          state: locationData.state,
          postal_code: locationData.postal_code,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingLocation.id)

      if (updateLocationError) {
        logger.error('Error updating event_locations', updateLocationError, {
          eventId,
          locationId: existingLocation.id,
        })
        return { success: false, error: 'Erro ao atualizar dados de localização' }
      }

      logger.info('Event location updated', { eventId, locationId: existingLocation.id })
    } else {
      const locationId = crypto.randomUUID()

      const { error: insertLocationError } = await supabase.from('event_locations').insert({
        id: locationId,
        tenant_id: event.tenant_id,
        event_id: eventId,
        raw_address: locationData.raw_address,
        street: locationData.street,
        number: locationData.number,
        complement: locationData.complement,
        neighborhood: locationData.neighborhood,
        city: locationData.city,
        state: locationData.state,
        postal_code: locationData.postal_code,
        is_primary: true,
        location_role: 'VENUE',
      })

      if (insertLocationError) {
        logger.error('Error inserting event_locations', insertLocationError, { eventId, locationId })
        return { success: false, error: 'Erro ao criar dados de localização' }
      }

      logger.info('Event location created', { eventId, locationId })
    }

    if (autoResolve) {
      const { error: resolveError } = await supabase
        .from('new_issues')
        .update({
          status: 'RESOLVED',
          resolved_at: new Date().toISOString(),
          current_value: locationData.raw_address,
        })
        .eq('id', issueId)

      if (resolveError) {
        logger.error('Error resolving issue', resolveError, { issueId })
        return { success: false, error: 'Erro ao resolver issue' }
      }

      const { data: remainingIssues } = await supabase
        .from('new_issues')
        .select('id')
        .eq('event_id', eventId)
        .in('status', ['OPEN', 'IN_REVIEW'])

      if (remainingIssues && remainingIssues.length === 0) {
        await supabase.from('new_events').update({ status: 'DRAFT' }).eq('id', eventId)

        await supabase
          .from('new_operations')
          .update({ status: 'SCHEDULED' })
          .eq('event_id', eventId)
          .eq('status', 'RECEIVED')
      }
    }

    revalidatePath(ROUTES.EVENT_DETAILS(eventId))

    return {
      success: true,
      message: 'Endereço atualizado com sucesso',
    }
  } catch (error) {
    logger.error(
      'Unexpected error updating event location',
      error instanceof Error ? error : new Error(String(error)),
    )
    return { success: false, error: 'Erro inesperado ao atualizar endereço' }
  }
}
