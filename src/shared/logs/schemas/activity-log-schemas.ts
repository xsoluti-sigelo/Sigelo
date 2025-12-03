import { z } from 'zod'

export const actionTypeSchema = z.enum([
  'LOGIN',
  'LOGOUT',
  'CREATE_EVENT',
  'UPDATE_EVENT',
  'DELETE_EVENT',
  'GENERATE_INVOICE',
  'CREATE_CLIENT',
  'UPDATE_CLIENT',
  'DELETE_CLIENT',
  'CREATE_EMPLOYEE',
  'UPDATE_EMPLOYEE',
  'DELETE_EMPLOYEE',
  'CREATE_USER',
  'UPDATE_USER',
  'DELETE_USER',
  'CREATE_MOLIDE_OPERATION',
  'UPDATE_MOLIDE_OPERATION',
  'DELETE_MOLIDE_OPERATION',
  'ASSIGN_DRIVER',
  'ASSIGN_VEHICLE',
  'EXPORT_DATA',
  'IMPORT_DATA',
  'SYNC_CONTAAZUL_PESSOAS',
  'SYNC_CONTAAZUL_SERVICOS',
])

export const jsonValueSchema: z.ZodType<
  string | number | boolean | null | Record<string, unknown> | unknown[]
> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
)

export const createLogSchema = z.object({
  action_type: actionTypeSchema,
  entity_type: z.string().optional(),
  entity_id: z.string().uuid().optional(),
  old_value: z.record(z.string(), jsonValueSchema).optional(),
  new_value: z.record(z.string(), jsonValueSchema).optional(),
  success: z.boolean().default(true),
  error_message: z.string().optional(),
  metadata: z.record(z.string(), jsonValueSchema).optional(),
})

export const logFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
  user_id: z.string().uuid().optional(),
  action_type: actionTypeSchema.optional(),
  entity_type: z.string().optional(),
  entity_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  success: z.boolean().optional(),
  search: z.string().optional(),
})

export const logExportSchema = z.object({
  format: z.enum(['csv', 'json', 'xlsx']),
  filters: logFiltersSchema.optional(),
  includeUserInfo: z.boolean().default(true),
})
