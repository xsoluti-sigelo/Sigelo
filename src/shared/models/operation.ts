export type OperationType =
  | 'MOBILIZATION'
  | 'DEMOBILIZATION'
  | 'LOADING'
  | 'UNLOADING'
  | 'CLEANING'
  | 'SUCTION'

export type OperationStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export type CleaningSubtype = 'post_use' | 'final' | null

export interface OperationBase {
  tenant_id: string
  event_id: string
  operation_type: OperationType | string
  operation_date: string
  operation_time: string
  status?: OperationStatus | string | null
}

export interface Operation extends OperationBase {
  id: string
  cleaning_subtype?: CleaningSubtype | string | null
  observations?: string | null
  created_at: string
  updated_at: string
}

export interface OperationDraft extends OperationBase {
  id?: string
  operation_hash?: string
  event_version?: number
  is_executed?: boolean
  equipment_standard?: number
  equipment_pcd?: number
}

export interface OperationDisplay {
  id: string
  event_id: string
  event_number: string
  event_title: string
  operation_type: OperationType | string
  scheduled_date: string
  scheduled_time: string
  status: OperationStatus | string
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
