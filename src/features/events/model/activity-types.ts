export interface ActivityLog {
  id: string
  action_type: string
  timestamp: string
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  users: {
    full_name: string
    email: string
  } | null
}
