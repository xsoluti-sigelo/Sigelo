import { createClient } from '@/shared/lib/supabase/server'
import { Employee } from '../types'
import { unstable_cache } from 'next/cache'
import { logger } from '@/shared/lib/logger'

export interface GetEmployeesParams {
  page?: number
  limit?: number
  search?: string
}

export async function getEmployees({ page = 1, limit = 10, search }: GetEmployeesParams = {}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const userData = await supabase
    .from('users')
    .select('tenant_id')
    .eq('google_id', user.id)
    .single()

  if (!userData.data) {
    throw new Error('User not found')
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('parties' as never)
    .select(
      `
      *,
      party_employees!inner(
        id,
        employee_number,
        identifier,
        hire_date,
        termination_date,
        cnh_number,
        cnh_type,
        cnh_expiration_date,
        is_driver,
        is_helper,
        employment_status
      ),
      party_contacts(
        contact_type,
        contact_value,
        is_primary
      )
    `,
      { count: 'exact' },
    )
    .eq('tenant_id', userData.data.tenant_id)
    .eq('party_type', 'PERSON')
    .eq('party_employees.active', true)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search) {
    query = query.or(
      `display_name.ilike.%${search}%,full_name.ilike.%${search}%,cpf.ilike.%${search}%`,
    )
  }

  const { data, error, count } = await query

  if (error) {
    logger.error('Error fetching employees', error, {
      tenantId: userData.data.tenant_id,
    })
    throw new Error('Failed to fetch employees')
  }

  const employees = (data || []).map((party: never) => {
    const employeeData = (party as never)['party_employees']?.[0] || {}
    const contacts = ((party as never)['party_contacts'] || []) as never[]

    const primaryEmail = contacts.find(
      (c: never) => (c as never)['contact_type'] === 'EMAIL' && (c as never)['is_primary'],
    )
    const primaryPhone = contacts.find(
      (c: never) =>
        ((c as never)['contact_type'] === 'PHONE' || (c as never)['contact_type'] === 'MOBILE') &&
        (c as never)['is_primary'],
    )

    return {
      ...(party as object),
      employee_id: (employeeData as never)['id'],
      employee_number: (employeeData as never)['employee_number'],
      identifier: (employeeData as never)['identifier'],
      hire_date: (employeeData as never)['hire_date'],
      termination_date: (employeeData as never)['termination_date'],
      employment_status: (employeeData as never)['employment_status'],
      cnh_number: (employeeData as never)['cnh_number'],
      cnh_type: (employeeData as never)['cnh_type'],
      cnh_expiration_date: (employeeData as never)['cnh_expiration_date'],
      cnh_expired: (employeeData as never)['cnh_expiration_date']
        ? new Date((employeeData as never)['cnh_expiration_date']) < new Date()
        : false,
      is_driver: (employeeData as never)['is_driver'],
      is_helper: (employeeData as never)['is_helper'],
      email: primaryEmail ? (primaryEmail as never)['contact_value'] : null,
      phone: primaryPhone ? (primaryPhone as never)['contact_value'] : null,
    }
  })

  const totalPages = count ? Math.ceil(count / limit) : 0

  return {
    data: employees as unknown as Employee[],
    totalPages,
    count: count || 0,
  }
}

export async function getEmployeeById(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const userData = await supabase
    .from('users')
    .select('tenant_id')
    .eq('google_id', user.id)
    .single()

  if (!userData.data) {
    throw new Error('User not found')
  }

  const getCachedEmployee = unstable_cache(
    async (employeeId: string, tenant: string) => {
      const { data, error } = await supabase
        .from('parties' as never)
        .select(
          `
          *,
          party_employees!inner(
            id,
            employee_number,
            identifier,
            hire_date,
            termination_date,
            cnh_number,
            cnh_type,
            cnh_expiration_date,
            is_driver,
            is_helper,
            employment_status
          ),
          party_contacts(
            contact_type,
            contact_value,
            is_primary,
            label
          ),
          party_addresses(
            address_type,
            street,
            number,
            complement,
            neighborhood,
            city,
            state,
            postal_code,
            is_primary
          )
        `,
        )
        .eq('id', employeeId)
        .eq('tenant_id', tenant)
        .eq('party_type', 'PERSON')
        .single()

      if (error) {
        logger.error('Error fetching employee', error, {
          employeeId,
          tenantId: tenant,
        })
        throw new Error('Employee not found')
      }

      const employeeData = (data as never)['party_employees']?.[0] || {}
      const contacts = ((data as never)['party_contacts'] || []) as never[]
      const addresses = ((data as never)['party_addresses'] || []) as never[]

      const primaryEmail = contacts.find(
        (c: never) => (c as never)['contact_type'] === 'EMAIL' && (c as never)['is_primary'],
      )
      const primaryPhone = contacts.find(
        (c: never) =>
          ((c as never)['contact_type'] === 'PHONE' || (c as never)['contact_type'] === 'MOBILE') &&
          (c as never)['is_primary'],
      )
      const primaryAddress = addresses.find((a: never) => (a as never)['is_primary'])

      return {
        ...(data as object),
        employee_id: (employeeData as never)['id'],
        employee_number: (employeeData as never)['employee_number'],
        identifier: (employeeData as never)['identifier'],
        hire_date: (employeeData as never)['hire_date'],
        termination_date: (employeeData as never)['termination_date'],
        employment_status: (employeeData as never)['employment_status'],
        cnh_number: (employeeData as never)['cnh_number'],
        cnh_type: (employeeData as never)['cnh_type'],
        cnh_expiration_date: (employeeData as never)['cnh_expiration_date'],
        cnh_expired: (employeeData as never)['cnh_expiration_date']
          ? new Date((employeeData as never)['cnh_expiration_date']) < new Date()
          : false,
        is_driver: (employeeData as never)['is_driver'],
        is_helper: (employeeData as never)['is_helper'],
        email: primaryEmail ? (primaryEmail as never)['contact_value'] : null,
        phone: primaryPhone ? (primaryPhone as never)['contact_value'] : null,
        primary_address: primaryAddress
          ? {
              postal_code: (primaryAddress as never)['postal_code'],
              street: (primaryAddress as never)['street'],
              number: (primaryAddress as never)['number'],
              complement: (primaryAddress as never)['complement'],
              neighborhood: (primaryAddress as never)['neighborhood'],
              city: (primaryAddress as never)['city'],
              state: (primaryAddress as never)['state'],
            }
          : null,
      } as unknown as Employee
    },
    [`employee-${id}`],
    {
      tags: [`employee-${id}`],
      revalidate: 60,
    },
  )

  return getCachedEmployee(id, userData.data.tenant_id)
}
