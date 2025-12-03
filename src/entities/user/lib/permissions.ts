import type {
  UserRole,
  Permission,
  Resource,
  PermissionCheck,
  ResourcePermissions,
  UserPermissions,
} from '../model/types'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'read',
    'write',
    'delete',
    'manage_users',
    'manage_events',
    'manage_vehicles',
    'manage_employees',
    'manage_integrations',
    'view_reports',
    'export_data',
  ],
  OPERATOR: [
    'read',
    'write',
    'manage_events',
    'manage_vehicles',
    'manage_employees',
    'view_reports',
    'export_data',
  ],
  VIEWER: ['read', 'view_reports'],
}

const RESOURCE_PERMISSIONS: Record<
  Resource,
  { read: UserRole[]; write: UserRole[]; delete: UserRole[] }
> = {
  events: {
    read: ['ADMIN', 'OPERATOR', 'VIEWER'],
    write: ['ADMIN', 'OPERATOR'],
    delete: ['ADMIN'],
  },
  vehicles: {
    read: ['ADMIN', 'OPERATOR', 'VIEWER'],
    write: ['ADMIN', 'OPERATOR'],
    delete: ['ADMIN'],
  },
  employees: {
    read: ['ADMIN', 'OPERATOR', 'VIEWER'],
    write: ['ADMIN', 'OPERATOR'],
    delete: ['ADMIN'],
  },
  users: {
    read: ['ADMIN'],
    write: ['ADMIN'],
    delete: ['ADMIN'],
  },
  integrations: {
    read: ['ADMIN'],
    write: ['ADMIN'],
    delete: ['ADMIN'],
  },
  reports: {
    read: ['ADMIN', 'OPERATOR', 'VIEWER'],
    write: ['ADMIN', 'OPERATOR'],
    delete: ['ADMIN'],
  },
  molide: {
    read: ['ADMIN', 'OPERATOR', 'VIEWER'],
    write: ['ADMIN', 'OPERATOR'],
    delete: ['ADMIN'],
  },
  documents: {
    read: ['ADMIN', 'OPERATOR', 'VIEWER'],
    write: ['ADMIN', 'OPERATOR'],
    delete: ['ADMIN'],
  },
}

export function hasPermission(role: UserRole | string, permission: Permission): boolean {
  const userRole = role as UserRole
  const permissions = ROLE_PERMISSIONS[userRole]
  return permissions ? permissions.includes(permission) : false
}

export function hasAnyPermission(role: UserRole | string, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission))
}

export function hasAllPermissions(role: UserRole | string, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission))
}

export function canAccessResource(
  role: UserRole | string,
  resource: Resource,
  action: 'read' | 'write' | 'delete',
): boolean {
  const userRole = role as UserRole
  const resourceConfig = RESOURCE_PERMISSIONS[resource]
  return resourceConfig ? resourceConfig[action].includes(userRole) : false
}

export function checkPermission(role: UserRole | string, permission: Permission): PermissionCheck {
  const hasAccess = hasPermission(role, permission)
  return {
    hasPermission: hasAccess,
    reason: hasAccess ? undefined : `Role ${role} não possui permissão ${permission}`,
  }
}

export function requirePermission(role: UserRole | string, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Sem permissão para realizar esta operação. Requer permissão: ${permission}`)
  }
}

export function requireAnyPermission(role: UserRole | string, permissions: Permission[]): void {
  if (!hasAnyPermission(role, permissions)) {
    throw new Error(
      `Sem permissão para realizar esta operação. Requer uma das permissões: ${permissions.join(', ')}`,
    )
  }
}

export function requireAllPermissions(role: UserRole | string, permissions: Permission[]): void {
  if (!hasAllPermissions(role, permissions)) {
    throw new Error(
      `Sem permissão para realizar esta operação. Requer todas as permissões: ${permissions.join(', ')}`,
    )
  }
}

export function requireResourceAccess(
  role: UserRole | string,
  resource: Resource,
  action: 'read' | 'write' | 'delete',
): void {
  if (!canAccessResource(role, resource, action)) {
    throw new Error(`Sem permissão para ${action} no recurso ${resource}`)
  }
}

export function requireWritePermission(role: UserRole | string): void {
  const allowedRoles: UserRole[] = ['ADMIN', 'OPERATOR']
  if (!allowedRoles.includes(role as UserRole)) {
    throw new Error('Sem permissão para realizar esta operação. Requer role ADMIN ou OPERATOR.')
  }
}

export function requireAdminPermission(role: UserRole | string): void {
  if (role !== 'ADMIN') {
    throw new Error('Sem permissão para realizar esta operação. Requer role ADMIN.')
  }
}

export function hasWritePermission(role: UserRole | string): boolean {
  const allowedRoles: UserRole[] = ['ADMIN', 'OPERATOR']
  return allowedRoles.includes(role as UserRole)
}

export function isAdmin(role: UserRole | string): boolean {
  return role === 'ADMIN'
}

export function isOperator(role: UserRole | string): boolean {
  return role === 'OPERATOR'
}

export function isViewer(role: UserRole | string): boolean {
  return role === 'VIEWER'
}

export function getRolePermissions(role: UserRole | string): Permission[] {
  const userRole = role as UserRole
  return ROLE_PERMISSIONS[userRole] || []
}

export function getResourcePermissions(
  role: UserRole | string,
  resource: Resource,
): ResourcePermissions {
  return {
    resource,
    canRead: canAccessResource(role, resource, 'read'),
    canWrite: canAccessResource(role, resource, 'write'),
    canDelete: canAccessResource(role, resource, 'delete'),
  }
}

export function getUserPermissions(role: UserRole | string): UserPermissions {
  const userRole = role as UserRole
  const allResources: Resource[] = [
    'events',
    'vehicles',
    'employees',
    'users',
    'integrations',
    'reports',
    'molide',
    'documents',
  ]

  const resources = allResources.reduce(
    (acc, resource) => {
      acc[resource] = getResourcePermissions(userRole, resource)
      return acc
    },
    {} as Record<Resource, ResourcePermissions>,
  )

  return {
    role: userRole,
    resources,
    allPermissions: getRolePermissions(userRole),
  }
}

export function canManageUsers(role: UserRole | string): boolean {
  return hasPermission(role, 'manage_users')
}

export function canManageEvents(role: UserRole | string): boolean {
  return hasPermission(role, 'manage_events')
}

export function canManageVehicles(role: UserRole | string): boolean {
  return hasPermission(role, 'manage_vehicles')
}

export function canManageEmployees(role: UserRole | string): boolean {
  return hasPermission(role, 'manage_employees')
}

export function canManageIntegrations(role: UserRole | string): boolean {
  return hasPermission(role, 'manage_integrations')
}

export function canViewReports(role: UserRole | string): boolean {
  return hasPermission(role, 'view_reports')
}

export function canExportData(role: UserRole | string): boolean {
  return hasPermission(role, 'export_data')
}

export function getRoleHierarchy(): Record<UserRole, number> {
  return {
    ADMIN: 3,
    OPERATOR: 2,
    VIEWER: 1,
  }
}

export function hasHigherRole(role: UserRole | string, targetRole: UserRole | string): boolean {
  const hierarchy = getRoleHierarchy()
  const userLevel = hierarchy[role as UserRole] || 0
  const targetLevel = hierarchy[targetRole as UserRole] || 0
  return userLevel > targetLevel
}

export function getRoleName(role: UserRole | string): string {
  const roleNames: Record<UserRole, string> = {
    ADMIN: 'Administrador',
    OPERATOR: 'Operador',
    VIEWER: 'Visualizador',
  }
  return roleNames[role as UserRole] || role
}

export function getRoleDescription(role: UserRole | string): string {
  const descriptions: Record<UserRole, string> = {
    ADMIN: 'Acesso total ao sistema, incluindo gerenciamento de usuários e configurações',
    OPERATOR:
      'Pode criar, editar e gerenciar recursos operacionais como eventos, veículos e funcionários',
    VIEWER: 'Apenas visualização de dados e relatórios, sem permissões de edição',
  }
  return descriptions[role as UserRole] || ''
}
