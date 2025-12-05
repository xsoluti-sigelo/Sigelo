import { OperationType, OperationStatus } from '@/features/operations/config/operations-config'

export interface GetOperationsParams {
  page?: number
  limit?: number
  search?: string
  event_search?: string
  of_search?: string
  event_id?: string
  operation_type?: OperationType
  status?: OperationStatus
  start_date?: string
  end_date?: string
}

export interface EventData {
  id: string
  number: string
  year: number
  name: string
  location: string | null
  source: string | null
  event_locations?: Array<{
    formatted_address?: string | null
    raw_address?: string | null
  }>
  new_events_contaazul_pessoas?: Array<{
    contaazul_pessoas?: {
      name?: string
    }
  }>
}

export interface OperationData {
  id: string
  event_id: string
  type: string
  subtype: string | null
  date: string
  time: string
  duration: number | null
  status: string | null
  driver: string | null
  helper: string | null
  vehicle: string | null
  vehicle_type: string | null
  notes: string | null
  new_events: EventData
}

export interface OrderData {
  event_id: string
  number: string
  is_cancelled: boolean | null
  new_order_items?: Array<{
    description: string
    quantity: number
  }>
}

export interface ProducerData {
  event_id: string
  name: string
  phone: string | null
  is_primary: boolean | null
}

export interface EquipmentInfo {
  std: number
  pcd: number
  ofNumbers: string[]
  ofNumbersStd: string[]
  ofNumbersPcd: string[]
}

export interface ProducerInfo {
  name: string
  phone: string | null
}
