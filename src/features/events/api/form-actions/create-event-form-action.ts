'use server'

import { createNewEventFull } from '../mutations/create-new-event-full'
import type { CreateNewEventFullData } from '../mutations/create-new-event-full'

interface CreateEventFormState {
  success: boolean
  eventId?: string
  error?: string
}

export async function createEventFormAction(
  prevState: CreateEventFormState | null,
  formData: FormData,
): Promise<CreateEventFormState> {
  try {
    const rawData = formData.get('data') as string

    if (!rawData) {
      return {
        success: false,
        error: 'Dados do formulário não encontrados',
      }
    }

    const data: CreateNewEventFullData = JSON.parse(rawData)

    const result = await createNewEventFull(data)

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Erro ao criar evento',
      }
    }

    return {
      success: true,
      eventId: result.eventId,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar evento',
    }
  }
}
