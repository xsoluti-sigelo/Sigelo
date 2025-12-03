import type { User } from '@supabase/supabase-js'

export interface AuthError {
  message: string
  code?: string
}

export interface AuthState {
  isLoading: boolean
  error: AuthError | null
}

export interface AuthUser extends User {
  id: string
  email: string
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_at: number
  user: AuthUser
}

export interface AuthHookReturn {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  error: AuthError | null
}

export interface UserHookReturn {
  user: User | null
  loading: boolean
  email: string | null
  id: string | null
  metadata: Record<string, unknown>
}

export interface SignOutResult {
  success: boolean
  error?: string
}

export interface GetUserResult {
  user: User | null
  error?: string
}

export type OAuthProvider = 'google'

export interface OAuthOptions {
  redirectTo?: string
  scopes?: string
}

export interface InviteToken {
  token: string
  email: string
  role: string
  expiresAt: Date
}

export interface SessionRefreshOptions {
  force?: boolean
}

export interface AuthCallbackParams {
  code?: string
  error?: string
  error_description?: string
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

export interface PermissionConfig {
  role: UserRole
  permissions: Permission[]
}

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
