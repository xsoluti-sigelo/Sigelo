import type { Database } from '@/types/database.types'

export type AuditLogRow = Database['public']['Tables']['audit_logs']['Row']

export interface AuditLog extends AuditLogRow {
  users?: {
    id: string
    full_name: string | null
    email: string | null
  } | null
}
