import type { Database, Json } from '@/types/database.types'

export type EventChangeLogEntity = Database['public']['Enums']['event_log_entity_enum']
export type EventChangeLogAction = Database['public']['Enums']['event_log_action_enum']

export type JsonValue = Json

export type EventChangeLogRecord = Database['public']['Tables']['event_change_logs']['Row'] & {
  users?: {
    full_name: string | null
    email: string | null
  } | null
  operation?: {
    type: Database['public']['Enums']['molide_operation_enum'] | null
    subtype?: string | null
    date?: string | null
    time?: string | null
  } | null
}

export interface EventFieldChange {
  field?: string
  oldValue?: JsonValue | null
  newValue?: JsonValue | null
}

export interface EventChangeLogInput {
  eventId: string
  entity: EventChangeLogEntity
  action: EventChangeLogAction
  operationId?: string | null
  tenantId?: string
  field?: string
  oldValue?: JsonValue | null
  newValue?: JsonValue | null
  changes?: EventFieldChange[]
  changedBy?: string | null
  changedByName?: string | null
  source?: string
  context?: JsonValue | null
}

export interface BuildEventFieldChangesOptions {
  fields?: string[]
  omitFields?: string[]
  mapFieldName?: (field: string) => string
  serializeValue?: (field: string, value: unknown) => JsonValue | null
  shouldInclude?: (field: string, oldValue: JsonValue | null, newValue: JsonValue | null) => boolean
}
