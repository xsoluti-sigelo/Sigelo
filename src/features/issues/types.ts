import type { Database } from '@/types/database.types'

export type IssueRow = Database['public']['Tables']['new_issues']['Row']
export type IssueInsert = Database['public']['Tables']['new_issues']['Insert']
export type IssueUpdate = Database['public']['Tables']['new_issues']['Update']

export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type IssueStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'IGNORED'

export type IssueType =
  | 'missing_event_id'
  | 'missing_start_date'
  | 'incomplete_address'
  | 'invalid_time'
  | 'no_items'
  | 'geocoding_failed'
  | 'time_conflict'
  | 'time_inconsistent'
  | 'missing_assignment'

export interface Issue {
  id: string
  event_id: string
  type: IssueType
  severity: IssueSeverity
  status: IssueStatus
  message: string
  field_affected?: string | null
  current_value?: string | null
  suggested_value?: string | null
  created_at: string | null
  resolved_at: string | null
}

export interface IssueResolutionInput {
  issueId: string
  eventId: string
  resolution?: 'fixed' | 'confirmed' | 'ignored'
  notes?: string
  updatedValue?: string
}
