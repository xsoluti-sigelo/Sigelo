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
  session_id?: string
  timestamp: string
  action_type: ActionType
  entity_type?: string
  entity_id?: string
  page_url?: string
  component_name?: string
  element_id?: string
  old_value?: Record<string, JsonValue>
  new_value?: Record<string, JsonValue>
  ip_address?: string
  user_agent?: string
  success: boolean
  error_message?: string
  metadata?: Record<string, JsonValue>
  users?: {
    id: string
    full_name: string | null
    email: string | null
  } | null
}

export interface CreateActivityLogParams {
  action_type: ActionType
  entity_type?: string
  entity_id?: string
  old_value?: Record<string, JsonValue>
  new_value?: Record<string, JsonValue>
  success?: boolean
  error_message?: string
  metadata?: Record<string, JsonValue>
}
