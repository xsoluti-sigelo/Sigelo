'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/shared/lib/supabase/server'
import { getUserData } from '@/entities/user'
import { generateOperationsSchema } from '@/shared/lib/validations/event'
import type { GenerateOperationsResult } from '../types/operation.types'
import { fetchEventRecord, shouldUseDeterministicGenerator } from './services/event-fetcher'
import { tryGenerateWithEdgeFunction } from './generators/edge-function-client'
import { generateBasicOperations } from './generators/basic-generator'

export async function generateOperationsForNewEvent(
  eventId: string,
): Promise<GenerateOperationsResult> {
  const supabase = await createClient()
  const userData = await getUserData()

  if (!userData?.tenant_id) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const event = await fetchEventRecord(supabase, eventId)

    if (!event) {
      return {
        success: false,
        error: 'Evento não encontrado',
      }
    }

    if (!event.start_time || !event.end_time || !(event.start_date || event.date)) {
      return {
        success: false,
        error: 'Evento deve ter data e horários definidos',
      }
    }

    if (shouldUseDeterministicGenerator(event)) {
      const result = await generateBasicOperations(supabase, event, eventId, userData)
      return result
    }

    const edgeResult = await tryGenerateWithEdgeFunction(supabase, event, eventId, userData)
    if (edgeResult) {
      return edgeResult
    }

    const fallbackResult = await generateBasicOperations(supabase, event, eventId, userData)
    return fallbackResult
  } catch {
    return {
      success: false,
      error: 'Erro interno ao gerar operações',
    }
  }
}

export async function generateOperations(
  _prevState: GenerateOperationsResult | null,
  formData: FormData,
): Promise<GenerateOperationsResult> {
  const eventId = formData.get('eventId') as string

  const result = generateOperationsSchema.safeParse({ eventId })

  if (!result.success) {
    return {
      success: false,
      error: 'ID do evento inválido',
    }
  }

  const { eventId: validEventId } = result.data
  const userData = await getUserData()
  if (!userData?.tenant_id) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const result = await generateOperationsForNewEvent(validEventId)

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to generate operations',
      }
    }

    revalidatePath(`/eventos/${validEventId}`)
    revalidatePath('/operacoes')

    const finalResult = {
      success: true as const,
      operationsCount: result.operations?.length || 0,
      message: `Generated ${result.operations?.length || 0} operations`,
    }
    return finalResult
  } catch {
    return { success: false, error: 'Error generating operations' }
  }
}
