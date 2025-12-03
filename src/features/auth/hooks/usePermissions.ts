'use client'

import { useMemo } from 'react'
import { useUser } from '@/entities/user'
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessResource,
  isOperator,
  isViewer,
  getRolePermissions,
  getUserPermissions,
  canManageUsers,
  canManageEvents,
  canManageVehicles,
  canManageEmployees,
  canManageIntegrations,
  canViewReports,
  canExportData,
  hasHigherRole,
  getRoleName,
  getRoleDescription,
} from '../lib/permissions'
import type { UserRole, Permission, Resource, UserPermissions } from '../model/types'

export interface UsePermissionsReturn {
  role: UserRole | null
  loading: boolean
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  canAccessResource: (resource: Resource, action: 'read' | 'write' | 'delete') => boolean
  hasWritePermission: boolean
  isAdmin: boolean
  isOperator: boolean
  isViewer: boolean
  canManageUsers: boolean
  canManageEvents: boolean
  canManageVehicles: boolean
  canManageEmployees: boolean
  canManageIntegrations: boolean
  canViewReports: boolean
  canExportData: boolean
  hasHigherRole: (targetRole: UserRole) => boolean
  roleName: string
  roleDescription: string
  allPermissions: Permission[]
  userPermissions: UserPermissions | null
}

export function usePermissions(): UsePermissionsReturn {
  const { role: userRole, canWrite, isAdmin: userIsAdmin } = useUser()

  const role = userRole as UserRole

  const userPermissions = useMemo(() => {
    if (!role) return null
    return getUserPermissions(role)
  }, [role])

  const allPermissions = useMemo(() => {
    if (!role) return []
    return getRolePermissions(role)
  }, [role])

  return {
    role,
    loading: false,
    hasPermission: (permission: Permission) => (role ? hasPermission(role, permission) : false),
    hasAnyPermission: (permissions: Permission[]) =>
      role ? hasAnyPermission(role, permissions) : false,
    hasAllPermissions: (permissions: Permission[]) =>
      role ? hasAllPermissions(role, permissions) : false,
    canAccessResource: (resource: Resource, action: 'read' | 'write' | 'delete') =>
      role ? canAccessResource(role, resource, action) : false,
    hasWritePermission: canWrite,
    isAdmin: userIsAdmin,
    isOperator: role ? isOperator(role) : false,
    isViewer: role ? isViewer(role) : false,
    canManageUsers: role ? canManageUsers(role) : false,
    canManageEvents: role ? canManageEvents(role) : false,
    canManageVehicles: role ? canManageVehicles(role) : false,
    canManageEmployees: role ? canManageEmployees(role) : false,
    canManageIntegrations: role ? canManageIntegrations(role) : false,
    canViewReports: role ? canViewReports(role) : false,
    canExportData: role ? canExportData(role) : false,
    hasHigherRole: (targetRole: UserRole) => (role ? hasHigherRole(role, targetRole) : false),
    roleName: role ? getRoleName(role) : '',
    roleDescription: role ? getRoleDescription(role) : '',
    allPermissions,
    userPermissions,
  }
}
