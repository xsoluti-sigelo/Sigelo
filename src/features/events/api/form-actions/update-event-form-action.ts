'use server'

import { updateNewEventFull } from '../mutations/update-new-event-full'
import type { UpdateNewEventFullData } from '../mutations/update-new-event-full'

interface UpdateEventFormState {
  success: boolean
  error?: string
}

export async function updateEventFormAction(
  prevState: UpdateEventFormState | null,
  formData: FormData,
): Promise<UpdateEventFormState> {
  try {
    const eventId = formData.get('eventId') as string
    const rawData = formData.get('data') as string

    if (!rawData) {
      return {
        success: false,
        error: 'Dados do formulário não encontrados',
      }
    }

    const data: UpdateNewEventFullData = JSON.parse(rawData)

    const result = await updateNewEventFull(eventId, data)

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Erro ao atualizar evento',
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar evento',
    }
  }
}
