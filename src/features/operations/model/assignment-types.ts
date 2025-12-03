import { AssignmentRole } from '@/shared/config/enums'
import type { Party, Vehicle } from './shared-types'

export interface ServiceAssignment {
  id: string
  tenant_id: string
  molide_operation_id: string
  party_id: string
  assignment_role: AssignmentRole
  created_at: string
  parties?: Party
}

export interface VehicleAssignment {
  id: string
  tenant_id: string
  molide_operation_id: string
  vehicle_id: string
  created_at: string
  vehicles?: Vehicle
}

export interface AssignmentResponse {
  serviceAssignments: ServiceAssignment[]
  vehicleAssignment: VehicleAssignment | null
}

export interface DriverOption {
  id: string
  display_name: string
  full_name?: string | null
  party_roles?: Array<{
    id: string
    tenant_id: string
    party_id: string
    role_type: string
    is_driver: boolean
    active: boolean
    created_at: string
    updated_at: string
  }>
}

export interface VehicleOption {
  id: string
  license_plate: string
  brand: string
  model: string
}
