import { User as SupabaseUser } from '@supabase/supabase-js'

export type User = SupabaseUser

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface AuthSession {
  user: User
  access_token: string
  refresh_token: string
}

export type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER'

export type Permission =
  | 'read'
  | 'write'
  | 'delete'
  | 'manage_users'
  | 'manage_events'
  | 'manage_vehicles'
  | 'manage_employees'
  | 'manage_integrations'
  | 'view_reports'
  | 'export_data'

export type Resource =
  | 'events'
  | 'vehicles'
  | 'employees'
  | 'users'
  | 'integrations'
  | 'reports'
  | 'molide'
  | 'documents'

export interface PermissionCheck {
  hasPermission: boolean
  reason?: string
}

export interface ResourcePermissions {
  resource: Resource
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
}

export interface UserPermissions {
  role: UserRole
  resources: Record<Resource, ResourcePermissions>
  allPermissions: Permission[]
}
