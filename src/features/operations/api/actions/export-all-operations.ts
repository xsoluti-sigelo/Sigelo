'use server'

import { getAllOperationsForExport, getOperationsByIds } from '../queries/get-operations'
import type { OperationDisplay } from '@/features/operations/model/types'
import { OperationType, OperationStatus } from '@/features/operations/config/operations-config'

export interface ExportFilters {
  search?: string
  event_search?: string
  of_search?: string
  operation_type?: string
  status?: string
  start_date?: string
  end_date?: string
}

export async function fetchAllOperationsForExport(
  filters: ExportFilters,
): Promise<{ success: boolean; data: OperationDisplay[]; error?: string }> {
  try {
    const data = await getAllOperationsForExport({
      search: filters.search,
      event_search: filters.event_search,
      of_search: filters.of_search,
      operation_type: filters.operation_type as OperationType | undefined,
      status: filters.status as OperationStatus | undefined,
      start_date: filters.start_date,
      end_date: filters.end_date,
    })
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch operations',
    }
  }
}

export async function fetchOperationsByIds(
  ids: string[],
): Promise<{ success: boolean; data: OperationDisplay[]; error?: string }> {
  try {
    const data = await getOperationsByIds(ids)
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch operations by IDs',
    }
  }
}
