import { createActivityLog } from '@/features/logs'
import type {
  GenerateOperationsResult,
  EdgeFunctionResult,
} from '../../types/operation.types'
import type { EventRow, NewOrderRow, NewOrderItemRow, SupabaseClient, UserContext } from '../../model/shared-types'
import { replaceEventOperations } from '../services/operations-replacer'
import { OperationType, OperationStatus } from '../../config/operations-config'

export async function tryGenerateWithEdgeFunction(
  supabase: SupabaseClient,
  event: EventRow,
  eventId: string,
  userData: UserContext,
): Promise<GenerateOperationsResult | null> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return null
  }

  const payload = await buildEdgePayload(supabase, event, eventId)
  if (!payload) {
    return null
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/order-extractor/test/molide`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ eventData: payload }),
  }).catch(() => {
    return null
  })

  if (!response || !response.ok) {
    return null
  }

  const result = (await response.json()) as EdgeFunctionResult
  if (!result.success || !result.molideResult) {
    return null
  }

  const operations = mapEdgeOperations(result.molideResult.operations, eventId, userData.tenant_id)
  const persisted = await replaceEventOperations(supabase, eventId, operations, userData, {
    generator: 'edge_function',
    context: {
      event_type: result.molideResult.eventType,
      source: event.source,
    },
  })

  if (!persisted.success) {
    return persisted
  }

  await createActivityLog({
    action_type: 'CREATE_MOLIDE_OPERATION',
    entity_type: 'operation',
    entity_id: eventId,
    new_value: {
      event_type: result.molideResult.eventType,
      operations_count: operations.length,
    },
  })

  return persisted
}

async function buildEdgePayload(
  supabase: SupabaseClient,
  event: EventRow,
  eventId: string,
) {
  const startDate = event.start_date || event.date
  const endDate = event.end_date || event.date || event.start_date

  if (!startDate) {
    return null
  }

  const payload = {
    id: event.id,
    year: event.year,
    description: event.name,
    startDate,
    endDate: endDate || startDate,
    startTime: event.start_time?.replace(/:00$/, '') || '00:00',
    endTime: event.end_time?.replace(/:00$/, '') || '00:00',
    location: event.location || '',
    contract: event.contract || '',
    items: [] as Array<{
      quantity: number
      description: string
      days: number
      price: string
      totalValue: number
    }>,
    producers: [] as string[],
    coordinators: [] as string[],
    isCancelled: event.is_cancelled || false,
  }

  const { data: orders, error } = await supabase
    .from('new_orders')
    .select(
      `
        *,
        new_order_items(*)
      `,
    )
    .eq('event_id', eventId)
    .eq('is_cancelled', false)

  if (error) {
    return null
  }

  if (orders && orders.length > 0) {
    payload.items = orders.flatMap(
      (order: NewOrderRow & { new_order_items?: NewOrderItemRow[] | null }) => {
        return (order.new_order_items || []).map((item) => ({
          quantity: item.quantity,
          description: item.description,
          days: item.days,
          price: item.unit_price?.toString() || '0',
          totalValue: item.item_total,
        }))
      },
    )
  }

  return payload
}

function mapEdgeOperations(
  operations: NonNullable<EdgeFunctionResult['molideResult']>['operations'],
  eventId: string,
  tenant_id: string,
) {
  const validStatuses = [
    OperationStatus.SCHEDULED,
    OperationStatus.RECEIVED,
    OperationStatus.VERIFIED,
    OperationStatus.IN_PROGRESS,
    OperationStatus.COMPLETED,
    OperationStatus.CANCELLED,
    OperationStatus.INCOMPLETE,
    OperationStatus.TIME_ERROR,
    OperationStatus.NOT_FULFILLED,
  ] as const

  const validTypes = [
    OperationType.MOBILIZATION,
    OperationType.DEMOBILIZATION,
    OperationType.CLEANING,
    OperationType.SUCTION,
  ] as const

  return operations.map((op) => {
    const rawStatus = (op.status || OperationStatus.SCHEDULED).toUpperCase()
    const status = validStatuses.includes(rawStatus as never)
      ? rawStatus
      : OperationStatus.SCHEDULED

    const rawType = (op.type || OperationType.MOBILIZATION).toUpperCase()
    const type = validTypes.includes(rawType as never) ? rawType : OperationType.MOBILIZATION

    return {
      tenant_id,
      event_id: eventId,
      type: type as OperationType,
      subtype: op.subtype || null,
      date: op.date,
      time: op.time,
      duration: op.duration || 60,
      vehicle_type: op.vehicleType ? op.vehicleType.toUpperCase() : 'CARGA',
      driver: op.driver || null,
      vehicle: op.vehicle || null,
      helper: op.helper || null,
      status: status as OperationStatus,
      notes: op.notes || null,
    }
  })
}
