export interface EventProducer {
  id: string
  event_id: string
  party_id: string
  is_primary: boolean | null
  parties?: {
    id: string
    display_name: string
    full_name: string | null
    party_type: string | null
    party_contacts?: Array<{
      contact_type: string
      contact_value: string
      is_primary: boolean | null
    }>
  } | null
}
