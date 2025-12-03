import type { Employee } from '../types'

export function formatEmployeeNumber(employeeNumber: string | null | undefined): string {
  if (!employeeNumber) return '-'
  return employeeNumber.padStart(3, '0')
}

export function isCNHExpired(expirationDate: string | null | undefined): boolean {
  if (!expirationDate) return false
  return new Date(expirationDate) < new Date()
}

export function getEmploymentStatusLabel(status: Employee['employment_status']): string {
  const statusMap = {
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    ON_LEAVE: 'Afastado',
    TERMINATED: 'Desligado',
  }
  return status ? statusMap[status] : 'Desconhecido'
}

export function formatCNHType(cnhType: string | null | undefined): string {
  if (!cnhType) return '-'
  return cnhType
}

export function isDriver(employee: Employee): boolean {
  return employee.is_driver === true
}

export function isHelper(employee: Employee): boolean {
  return employee.is_helper === true
}

export function getEmployeeRoles(employee: Employee): string {
  const roles: string[] = []
  if (isDriver(employee)) roles.push('Motorista')
  if (isHelper(employee)) roles.push('Ajudante')
  return roles.length > 0 ? roles.join(', ') : '-'
}
