export type ActionType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE_EVENT'
  | 'UPDATE_EVENT'
  | 'DELETE_EVENT'
  | 'GENERATE_INVOICE'
  | 'CREATE_CLIENT'
  | 'UPDATE_CLIENT'
  | 'DELETE_CLIENT'
  | 'CREATE_EMPLOYEE'
  | 'UPDATE_EMPLOYEE'
  | 'DELETE_EMPLOYEE'
  | 'CREATE_USER'
  | 'UPDATE_USER'
  | 'DELETE_USER'
  | 'CREATE_MOLIDE_OPERATION'
  | 'UPDATE_MOLIDE_OPERATION'
  | 'DELETE_MOLIDE_OPERATION'
  | 'ASSIGN_DRIVER'
  | 'ASSIGN_VEHICLE'
  | 'EXPORT_DATA'
  | 'IMPORT_DATA'
  | 'SYNC_CONTAAZUL_PESSOAS'
  | 'SYNC_CONTAAZUL_SERVICOS'

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export interface ActivityLog {
  id: string
  tenant_id: string
  user_id: string
  session_id: string | null
  timestamp: string
  action_type: ActionType
  entity_type: string | null
  entity_id: string | null
  page_url: string | null
  component_name: string | null
  element_id: string | null
  old_value: Record<string, JsonValue> | null
  new_value: Record<string, JsonValue> | null
  ip_address: string | null
  user_agent: string | null
  success: boolean
  error_message: string | null
  metadata: Record<string, JsonValue> | null
  users?: {
    id: string
    full_name: string | null
    email: string | null
  } | null
}

export interface LogFilters {
  page?: number
  limit?: number
  user_id?: string
  action_type?: ActionType
  entity_type?: string
  entity_id?: string
  start_date?: string
  end_date?: string
  success?: boolean
  search?: string
}

export interface LogsResponse {
  data: ActivityLog[]
  totalPages: number
  count: number
}

export interface CreateLogParams {
  action_type: ActionType
  entity_type?: string
  entity_id?: string
  old_value?: Record<string, JsonValue>
  new_value?: Record<string, JsonValue>
  success?: boolean
  error_message?: string
  metadata?: Record<string, JsonValue>
}

export interface LogExportOptions {
  format: 'csv' | 'json' | 'xlsx'
  filters?: LogFilters
  includeUserInfo?: boolean
}

export interface LogStats {
  totalLogs: number
  successRate: number
  topActions: Array<{ action: ActionType; count: number }>
  topUsers: Array<{ user_id: string; user_name: string; count: number }>
  activityByHour: Array<{ hour: number; count: number }>
}
