export interface EventAttachment {
  id: string
  file_name: string
  file_type: string
  file_size: number
  storage_path: string
  public_url?: string
  source?: 'database' | 'email'
  created_at: string
  order_fulfillments?: {
    of_number: string
  } | null
}
