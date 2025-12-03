export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED'

export interface Employee {
  id: string
  tenant_id: string
  party_type: 'PERSON'
  display_name: string
  full_name: string
  cpf?: string | null
  birth_date?: string | null
  active: boolean
  created_at: string
  updated_at: string

  employee_id?: string
  employee_number?: string | null
  identifier?: string | null
  hire_date?: string | null
  termination_date?: string | null
  employment_status?: EmploymentStatus

  cnh_number?: string | null
  cnh_type?: string | null
  cnh_expiration_date?: string | null
  cnh_expired?: boolean

  is_driver?: boolean
  is_helper?: boolean

  phone?: string | null
  email?: string | null
}
