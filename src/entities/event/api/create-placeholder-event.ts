'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { getUserData, requireWritePermission } from '@/entities/user'
import { logger } from '@/shared/lib/logger'

export interface CreatePlaceholderEventInput {
  eventNumber?: string
  eventDescription: string
  date: string
  address: {
    cep: string
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
  }
}

export interface CreatePlaceholderEventResponse {
  success: boolean
  eventId?: string
  generatedEventNumber?: string
  error?: string
}

async function generateUniqueEventNumber(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tenant_id: string,
  year: number,
): Promise<string> {
  const { data: lastEvent } = await supabase
    .from('new_events')
    .select('number')
    .eq('tenant_id', tenant_id)
    .eq('year', year)
    .order('number', { ascending: false })
    .limit(1)
    .single()

  if (!lastEvent?.number) {
    return '1'
  }

  const lastNumber = parseInt(lastEvent.number, 10)
  return String(lastNumber + 1)
}

export async function createPlaceholderEvent(
  input: CreatePlaceholderEventInput,
): Promise<CreatePlaceholderEventResponse> {
  const supabase = await createClient()
  const { role, tenant_id } = await getUserData()
  requireWritePermission(role)

  try {
    const year = Number(input.date.slice(0, 4))
    const eventId = crypto.randomUUID()

    let eventNumber = input.eventNumber
    if (!eventNumber) {
      eventNumber = await generateUniqueEventNumber(supabase, tenant_id, year)
    }

    const fullAddress = [
      input.address.street,
      input.address.number,
      input.address.complement,
      input.address.neighborhood,
      input.address.city,
      input.address.state,
      `CEP: ${input.address.cep}`,
    ]
      .filter(Boolean)
      .join(', ')

    const { error: createError } = await supabase.from('new_events').insert({
      id: eventId,
      tenant_id,
      number: eventNumber,
      year,
      name: input.eventDescription,
      contract: null,
      date: input.date,
      start_date: input.date,
      end_date: input.date,
      start_time: null,
      end_time: null,
      location: fullAddress,
      is_intermittent: false,
      email_id: null,
      source: 'NOT_LISTABLE',
      status: 'DRAFT',
    } as never)

    if (createError) {
      logger.error('Failed to create placeholder event', createError)
      return { success: false, error: 'Erro ao criar evento' }
    }

    const locationId = crypto.randomUUID()

    const { error: locationError } = await supabase.from('event_locations').insert({
      id: locationId,
      tenant_id,
      event_id: eventId,
      raw_address: fullAddress,
      street: input.address.street,
      number: input.address.number,
      complement: input.address.complement || null,
      neighborhood: input.address.neighborhood,
      city: input.address.city,
      state: input.address.state,
      postal_code: input.address.cep,
      is_primary: true,
      location_role: 'VENUE',
    } as never)

    if (locationError) {
      logger.error('Failed to create event location', locationError)
    }

    return { success: true, eventId, generatedEventNumber: eventNumber }
  } catch (error) {
    logger.error('Unexpected error creating placeholder event', error)
    return { success: false, error: 'Erro inesperado ao criar evento' }
  }
}
