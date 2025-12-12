import { OperationType, OperationStatus } from '@/features/operations/config/operations-config'
import { CleaningSubtype } from '@/shared/config/enums'

export interface OperationDisplay {
  id: string
  event_id: string
  event_number: string
  event_title: string
  client_name?: string | null
  operation_type: OperationType
  scheduled_date: string
  scheduled_time: string
  status: OperationStatus
  event_location?: string | null
  event_source?: string | null
  equipment_std?: number
  equipment_pcd?: number
  of_number?: string | null
  of_number_std?: string | null
  of_number_pcd?: string | null
  producer_name?: string | null
  producer_phone?: string | null
  driver_name?: string | null
  helper_name?: string | null
  vehicle_license_plate?: string | null
  instructions?: string | null
  observations?: string | null
}

export interface Operation {
  id: string
  tenant_id: string
  event_id: string
  operation_type: OperationType
  operation_date: string
  operation_time: string
  cleaning_subtype?: CleaningSubtype | null
  observations?: string | null
  status: OperationStatus
  created_at: string
  updated_at: string
}

export interface OperationDb {
  id: string
  tenant_id: string
  event_id: string
  type: OperationType
  subtype: string | null
  date: string
  time: string
  duration: number | null
  driver: string | null
  vehicle: string | null
  helper: string | null
  vehicle_type: string | null
  status: OperationStatus | null
  notes: string | null
  created_at: string
  updated_at: string
  new_events?: {
    id: string
    number: string
    year: string
    name: string
    date: string
    start_time: string
    end_time: string
    location: string
  }
}

export interface CreateOperationInput {
  event_id: string
  operation_type: OperationType
  operation_date: string
  operation_time: string
  cleaning_subtype?: CleaningSubtype | null
  observations?: string | null
  status?: OperationStatus
}

export interface OperationResponse {
  data: OperationDisplay[]
  totalPages: number
  count: number
}

export interface OperationComment {
  id: string
  operation_id: string
  tenant_id: string
  user_id: string
  comment_text: string
  created_at: string
  updated_at: string | null
  is_deleted: boolean
  is_pinned: boolean
  users?: {
    id: string
    full_name: string
    email: string
    picture_url: string | null
  } | null
}
