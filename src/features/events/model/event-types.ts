import { OperationType } from '@/features/operations/config/operations-config'
import type { CleaningRule } from '../config/events-config'

export interface EventFinancialData {
  id: string
  event_id: string
  tenant_id: string
  quantity: number | null
  payment_method: string | null
  payment_date: string | null
  created_at: string | null
  updated_at: string | null
}

export interface EventProducerDb {
  id: string
  event_id: string
  name: string
  role: string
  is_primary: boolean | null
  phone: string | null
  created_at: string | null
  updated_at: string | null
  document: string | null
  organization: string | null
}

export interface FullEventData {
  id: string
  tenant_id?: string
  number: string | null
  year: string | number | null
  name: string | null
  date: string | null
  start_time: string | null
  end_time: string | null
  location: string | null
  contract: string | null
  is_night_event: boolean | null
  is_intermittent: boolean | null
  is_cancelled: boolean | null
  status: string | null
  created_at: string | null
  updated_at: string | null
  cleaning_rule?: string | CleaningRule | null
  source?: string | null
  email_id?: string | null
}

export interface Operation {
  id?: string
  tenant_id: string
  event_id: string
  operation_type: OperationType
  operation_date: string
  operation_time: string
  operation_hash?: string
  event_version?: number
  is_executed?: boolean
  status?: string
  equipment_standard?: number
  equipment_pcd?: number
}

export interface OperationDiff {
  toCreate: Operation[]
  toUpdate: Array<{ existing: Operation; updated: Operation }>
  toCancel: Operation[]
  summary: {
    created: number
    updated: number
    cancelled: number
    unchanged: number
  }
}

export interface OperationRow {
  id: string
  status: string | null
}

export interface EventFormData {
  event_type: 'unique' | 'recurring' | 'continuous'
  start_datetime: string
  end_datetime?: string
  recurrence_rule?: {
    pattern?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'weekdays'
    weekdays?: number[]
    count?: number
  }
  cleaning_rule?: {
    weekdays?: number[]
    time?: string
  }
}

export interface CalculateDailyRateParams {
  eventType: 'unique' | 'recurring' | 'continuous'
  startDate: string
  endDate?: string
  recurrencePattern?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'weekdays'
  recurrenceCount?: number
  selectedWeekdays?: number[]
  cleaningWeekdays?: number[]
}
