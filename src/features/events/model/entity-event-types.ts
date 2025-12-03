import type { EventParty } from './shared-types'

export interface Event {
  id: string
  tenant_id: string
  client_id: string | null
  event_number: string
  event_year: number
  contract_number: string | null
  title: string
  description: string
  event_type: string | null
  status: string
  start_datetime: string
  end_datetime: string | null
  mobilization_datetime: string | null
  demobilization_datetime: string | null
  pre_cleaning_datetime: string | null
  post_cleaning_datetime: string | null

  recurrence_rule: Record<string, unknown> | null
  cleaning_rule: Record<string, unknown> | null
  periodic_exchange_rule: Record<string, unknown> | null

  daily_list: string[] | null
  general_observations: string | null
  logistics_notes: string | null
  billing_notes: string | null
  contract_evidence: string | null
  contract_received_at: string | null
  source_email_extraction_id: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
  verified_at: string | null
  verified_by: string | null
  parties?: EventParty | null
}

export interface EventWithClient extends Event {
  client_name: string
}

export interface EventListItem {
  id: string
  tenant_id: string
  client_id: string | null
  contract_number: string | null
  title: string | null
  event_description: string
  event_date: string
  end_date: string | null
  start_date: string | null
  event_type: string | null
  status: string
  created_at: string
  client_name?: string
}

export interface EventDisplay {
  id: string
  client_id: string
  client_name: string
  contract_name: string
  contract_number: string
  event_type: string
  status: string
  start_date: string
  end_date: string | null
  payment_date: string | null
  event_value: number
  received_at: string | null
}
