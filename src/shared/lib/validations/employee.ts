import { z } from 'zod'
import { isValidCPF, isValidPhone } from './common'

export const cnhTypeSchema = z.enum(['A', 'B', 'AB', 'C', 'D', 'E', 'AC', 'AD', 'AE'], {
  message: 'Tipo de CNH inválido',
})

export const employeeSchema = z
  .object({
    full_name: z
      .string()
      .min(1, 'Nome completo é obrigatório')
      .max(150, 'Máximo 150 caracteres')
      .trim(),
    cpf: z
      .string()
      .optional()
      .or(z.literal(''))
      .transform((val) => (val ? val.replace(/\D/g, '') : ''))
      .refine((val) => !val || val === '' || isValidCPF(val), { message: 'CPF inválido' }),
    birth_date: z.string().optional().nullable().or(z.literal('')),
    contact_email: z.string().email('Email inválido').optional().or(z.literal('')),
    contact_phone: z
      .string()
      .optional()
      .or(z.literal(''))
      .transform((val) => (val ? val.replace(/\D/g, '') : val))
      .refine((val) => !val || val === '' || isValidPhone(val), {
        message: 'Telefone deve ter 10 ou 11 dígitos',
      }),
    employee_number: z.string().max(50, 'Máximo 50 caracteres').optional().or(z.literal('')),
    identifier: z.string().max(50, 'Máximo 50 caracteres').optional().or(z.literal('')),
    hire_date: z.string().optional().or(z.literal('')),
    is_driver: z.boolean(),
    is_helper: z.boolean(),
    cnh_number: z.string().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),
    cnh_type: cnhTypeSchema.optional().nullable(),
    cnh_expiration_date: z.string().optional().or(z.literal('')),
  })
  .refine((data) => data.is_driver || data.is_helper, {
    message: 'Selecione pelo menos uma função (Motorista ou Ajudante)',
    path: ['is_driver'],
  })

export type EmployeeFormData = z.infer<typeof employeeSchema>
export type CNHType = z.infer<typeof cnhTypeSchema>
