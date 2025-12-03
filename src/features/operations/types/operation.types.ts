import type { Json } from '@/types/database.types'
import type { OperationData } from '../lib/operation-calculations'

export interface GenerateOperationsResult {
  success: boolean
  error?: string
  operations?: OperationData[]
  operationsCount?: number
  message?: string
}

export interface EdgeFunctionResult {
  success: boolean
  molideResult?: {
    eventType: string
    operations: Array<{
      type: string
      subtype?: string
      date: string
      time: string
      duration?: number
      vehicleType?: string
      driver?: string
      vehicle?: string
      helper?: string
      status?: string
      notes?: string
    }>
  }
}

export type LogContextPayload = Record<string, Json | undefined>

export interface ReplaceOperationsOptions {
  generator: 'edge_function' | 'deterministic'
  context?: LogContextPayload
}
