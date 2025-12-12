import { createClient } from '@/shared/lib/supabase/server'
import type {
  OperationDisplay,
  GetOperationsParams,
  OperationData,
  OrderData,
  ProducerData,
  EquipmentInfo,
  ProducerInfo,
} from '../../model/types'
import { OperationType, OperationStatus } from '@/features/operations/config/operations-config'

async function getEventIdsByOFSearch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  of_search: string,
): Promise<string[]> {
  const { data: ordersData } = await supabase
    .from('new_orders')
    .select('event_id, number')
    .ilike('number', `%${of_search}%`)

  if (!ordersData || ordersData.length === 0) {
    return []
  }

  return [...new Set(ordersData.map((o) => o.event_id))]
}

function processEquipmentByEvent(orders: OrderData[]): Map<string, EquipmentInfo> {
  const equipmentByEvent = new Map<string, EquipmentInfo>()

  orders.forEach((order) => {
    if (order.is_cancelled) return

    const existing = equipmentByEvent.get(order.event_id) || {
      std: 0,
      pcd: 0,
      kross: 0,
      pia: 0,
      ofNumbers: [],
      ofNumbersStd: [],
      ofNumbersPcd: [],
    }

    let hasStd = false
    let hasPcd = false

    ;(order.new_order_items || []).forEach((item) => {
      const description = item.description?.toUpperCase() || ''
      const quantity = item.quantity || 0

      if (description.includes('PCD') || description.includes('PNE')) {
        existing.pcd += quantity
        hasPcd = true
      } else if (description.includes('KROSS') || description.includes('MICTÓRIO')) {
        existing.kross += quantity
      } else if (description.includes('PIA')) {
        existing.pia += quantity
      } else if (description.includes('BANHEIRO') || description.includes('STANDARD')) {
        existing.std += quantity
        hasStd = true
      }
    })

    if (hasStd || hasPcd) {
      existing.ofNumbers.push(order.number)
      if (hasStd) existing.ofNumbersStd.push(order.number)
      if (hasPcd) existing.ofNumbersPcd.push(order.number)
    }

    equipmentByEvent.set(order.event_id, existing)
  })

  return equipmentByEvent
}

function processProducersByEvent(producers: ProducerData[]): Map<string, ProducerInfo> {
  const producerByEvent = new Map<string, ProducerInfo>()

  producers.forEach((producer) => {
    if (!producerByEvent.has(producer.event_id) || producer.is_primary) {
      producerByEvent.set(producer.event_id, {
        name: producer.name,
        phone: producer.phone,
      })
    }
  })

  return producerByEvent
}

interface CommentData {
  operation_id: string
  comment_text: string
  is_pinned?: boolean
  created_at: string
}

async function fetchCommentsForOperations(
  supabase: Awaited<ReturnType<typeof createClient>>,
  operationIds: string[],
): Promise<CommentData[]> {
  if (operationIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('operation_comments')
    .select('operation_id, comment_text, is_pinned, created_at')
    .in('operation_id', operationIds)
    .eq('is_deleted', false)

  if (error) {
    return []
  }

  return data || []
}

function processCommentsByOperation(comments: CommentData[]): Map<string, string> {
  const commentByOperation = new Map<string, string>()
  const groupedComments = new Map<string, CommentData[]>()

  comments.forEach((comment) => {
    const existing = groupedComments.get(comment.operation_id) || []
    existing.push(comment)
    groupedComments.set(comment.operation_id, existing)
  })

  groupedComments.forEach((opComments, operationId) => {
    const pinned = opComments.find((c) => c.is_pinned === true)
    if (pinned) {
      const textContent = pinned.comment_text.replace(/<[^>]*>/g, '').trim()
      commentByOperation.set(operationId, textContent)
      return
    }

    const sorted = opComments.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    if (sorted.length > 0) {
      const textContent = sorted[0].comment_text.replace(/<[^>]*>/g, '').trim()
      commentByOperation.set(operationId, textContent)
    }
  })

  return commentByOperation
}

function transformToOperationDisplay(
  operation: OperationData,
  equipment?: EquipmentInfo,
  producer?: ProducerInfo,
  observation?: string | null,
): OperationDisplay {
  const defaultEquipment: EquipmentInfo = {
    std: 0,
    pcd: 0,
    kross: 0,
    pia: 0,
    ofNumbers: [],
    ofNumbersStd: [],
    ofNumbersPcd: [],
  }

  const equipmentData = equipment || defaultEquipment

  const fullEventTitle =
    operation.new_events?.number && operation.new_events?.year && operation.new_events?.name
      ? `${operation.new_events.number} ${operation.new_events.year} - ${operation.new_events.name}`
      : operation.new_events?.name || 'Sem título'

  const rawEventLocation =
    operation.new_events?.event_locations?.[0]?.formatted_address ||
    operation.new_events?.event_locations?.[0]?.raw_address ||
    operation.new_events?.location ||
    'A definir'

  const eventLocation = rawEventLocation
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const clientName =
    operation.new_events?.new_events_contaazul_pessoas?.[0]?.contaazul_pessoas?.name ||
    'Sem cliente'

  return {
    id: operation.id,
    event_id: operation.event_id,
    event_number: operation.new_events?.number || '-',
    event_title: fullEventTitle,
    client_name: clientName,
    operation_type: operation.type as OperationType,
    scheduled_date: operation.date,
    scheduled_time: operation.time,
    status: (operation.status as OperationStatus) || OperationStatus.SCHEDULED,
    event_location: eventLocation,
    event_source: operation.new_events?.source || null,
    equipment_std: equipmentData.std,
    equipment_pcd: equipmentData.pcd,
    equipment_kross: equipmentData.kross,
    equipment_pia: equipmentData.pia,
    of_number: equipmentData.ofNumbers.join(', ') || null,
    of_number_std: equipmentData.ofNumbersStd.join(', ') || null,
    of_number_pcd: equipmentData.ofNumbersPcd.join(', ') || null,
    producer_name: producer?.name || 'Não definido',
    producer_phone: producer?.phone || null,
    driver_name: operation.driver,
    helper_name: operation.helper,
    vehicle_license_plate: operation.vehicle,
    instructions: operation.notes,
    observations: observation || null,
  }
}

export async function getOperations({
  page = 1,
  limit = 10,
  search = '',
  event_search = '',
  of_search = '',
  event_id,
  operation_type,
  status,
  start_date,
  end_date,
}: GetOperationsParams = {}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('google_id', user.id)
    .single()

  if (!userData?.tenant_id) {
    throw new Error('Tenant not found')
  }

  let eventIdsFromOF: string[] | undefined
  if (of_search) {
    eventIdsFromOF = await getEventIdsByOFSearch(supabase, of_search)

    if (eventIdsFromOF.length === 0) {
      return {
        data: [],
        totalPages: 0,
        count: 0,
      }
    }
  }

  let eventIdsFromSearch: string[] | undefined
  if (search) {
    const { data: eventsData } = await supabase
      .from('new_events')
      .select('id')
      .or(`name.ilike.%${search}%,number.ilike.%${search}%`)

    eventIdsFromSearch = eventsData?.map((e) => e.id) || []

    if (eventIdsFromSearch.length === 0 && !eventIdsFromOF) {
      return {
        data: [],
        totalPages: 0,
        count: 0,
      }
    }
  }

  let eventIdsFromEventSearch: string[] | undefined
  if (event_search) {
    const { data: eventsData } = await supabase
      .from('new_events')
      .select('id')
      .or(`name.ilike.%${event_search}%,number.ilike.%${event_search}%`)

    eventIdsFromEventSearch = eventsData?.map((e) => e.id) || []

    if (eventIdsFromEventSearch.length === 0 && !eventIdsFromOF && !eventIdsFromSearch) {
      return {
        data: [],
        totalPages: 0,
        count: 0,
      }
    }
  }

  let query = supabase.from('new_operations').select(
    `
      id,
      event_id,
      type,
      subtype,
      date,
      time,
      duration,
      driver,
      vehicle,
      helper,
      vehicle_type,
      status,
      notes,
      new_events(
        id,
        number,
        year,
        name,
        location,
        source,
        event_locations(
          formatted_address,
          raw_address
        ),
        new_events_contaazul_pessoas(
          contaazul_pessoas(
            name
          )
        )
      )
    `,
    { count: 'exact' },
  )

  const allEventIds = [
    ...(eventIdsFromSearch || []),
    ...(eventIdsFromEventSearch || []),
    ...(eventIdsFromOF || []),
  ]

  if (allEventIds.length > 0) {
    const uniqueEventIds = [...new Set(allEventIds)]
    query = query.in('event_id', uniqueEventIds)
  }

  if (event_id) {
    query = query.eq('event_id', event_id)
  }

  if (operation_type) {
    query = query.eq('type', operation_type)
  }

  if (status) {
    query = query.eq('status', status)
  }

  if (start_date) {
    query = query.gte('date', start_date)
  }

  if (end_date) {
    query = query.lte('date', end_date)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query
    .order('date', { ascending: true })
    .order('time', { ascending: true })
    .range(from, to)

  if (error) {
    throw new Error('Failed to fetch operations')
  }

  const eventIds = [...new Set((data || []).map((op) => op.new_events.id).filter(Boolean))]

  if (eventIds.length === 0) {
    const operationsDisplay = (data || []).map((op: OperationData) =>
      transformToOperationDisplay(op),
    )

    return {
      data: operationsDisplay,
      totalPages: count ? Math.ceil(count / limit) : 0,
      count: count || 0,
    }
  }

  const [ordersResult, producersResult] = await Promise.all([
    supabase
      .from('new_orders')
      .select(
        `
        event_id,
        number,
        is_cancelled,
        new_order_items(
          description,
          quantity
        )
      `,
      )
      .in('event_id', eventIds),
    supabase
      .from('new_people')
      .select('event_id, name, phone, is_primary, role')
      .in('event_id', eventIds)
      .in('role', ['producer', 'coordinator']),
  ])

  const equipmentByEvent = processEquipmentByEvent((ordersResult.data || []) as OrderData[])
  const producerByEvent = processProducersByEvent((producersResult.data || []) as ProducerData[])

  const operationsDisplay = (data || []).map((op: OperationData) => {
    const equipment = equipmentByEvent.get(op.new_events.id)
    const producer = producerByEvent.get(op.new_events.id)
    return transformToOperationDisplay(op, equipment, producer)
  })

  const totalPages = count ? Math.ceil(count / limit) : 0

  return {
    data: operationsDisplay,
    totalPages,
    count: count || 0,
  }
}

export type { GetOperationsParams }


export async function getAllOperationsForExport({
  search = '',
  event_search = '',
  of_search = '',
  event_id,
  operation_type,
  status,
  start_date,
  end_date,
}: Omit<GetOperationsParams, 'page' | 'limit'> = {}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('google_id', user.id)
    .single()

  if (!userData?.tenant_id) {
    throw new Error('Tenant not found')
  }

  let eventIdsFromOF: string[] | undefined
  if (of_search) {
    eventIdsFromOF = await getEventIdsByOFSearch(supabase, of_search)

    if (eventIdsFromOF.length === 0) {
      return []
    }
  }

  let eventIdsFromSearch: string[] | undefined
  if (search) {
    const { data: eventsData } = await supabase
      .from('new_events')
      .select('id')
      .or(`name.ilike.%${search}%,number.ilike.%${search}%`)

    eventIdsFromSearch = eventsData?.map((e) => e.id) || []

    if (eventIdsFromSearch.length === 0 && !eventIdsFromOF) {
      return []
    }
  }

  let eventIdsFromEventSearch: string[] | undefined
  if (event_search) {
    const { data: eventsData } = await supabase
      .from('new_events')
      .select('id')
      .or(`name.ilike.%${event_search}%,number.ilike.%${event_search}%`)

    eventIdsFromEventSearch = eventsData?.map((e) => e.id) || []

    if (eventIdsFromEventSearch.length === 0 && !eventIdsFromOF && !eventIdsFromSearch) {
      return []
    }
  }

  let query = supabase.from('new_operations').select(
    `
      id,
      event_id,
      type,
      subtype,
      date,
      time,
      duration,
      driver,
      vehicle,
      helper,
      vehicle_type,
      status,
      notes,
      new_events(
        id,
        number,
        year,
        name,
        location,
        source,
        event_locations(
          formatted_address,
          raw_address
        ),
        new_events_contaazul_pessoas(
          contaazul_pessoas(
            name
          )
        )
      )
    `,
  )

  const allEventIds = [
    ...(eventIdsFromSearch || []),
    ...(eventIdsFromEventSearch || []),
    ...(eventIdsFromOF || []),
  ]

  if (allEventIds.length > 0) {
    const uniqueEventIds = [...new Set(allEventIds)]
    query = query.in('event_id', uniqueEventIds)
  }

  if (event_id) {
    query = query.eq('event_id', event_id)
  }

  if (operation_type) {
    query = query.eq('type', operation_type)
  }

  if (status) {
    query = query.eq('status', status)
  }

  if (start_date) {
    query = query.gte('date', start_date)
  }

  if (end_date) {
    query = query.lte('date', end_date)
  }

  const { data, error } = await query
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (error) {
    throw new Error('Failed to fetch operations for export')
  }

  const eventIds = [...new Set((data || []).map((op) => op.new_events.id).filter(Boolean))]
  const operationIds = (data || []).map((op) => op.id)

  const comments = await fetchCommentsForOperations(supabase, operationIds)
  const commentByOperation = processCommentsByOperation(comments)

  if (eventIds.length === 0) {
    return (data || []).map((op: OperationData) => {
      const observation = commentByOperation.get(op.id)
      return transformToOperationDisplay(op, undefined, undefined, observation)
    })
  }

  const [ordersResult, producersResult] = await Promise.all([
    supabase
      .from('new_orders')
      .select(
        `
        event_id,
        number,
        is_cancelled,
        new_order_items(
          description,
          quantity
        )
      `,
      )
      .in('event_id', eventIds),
    supabase
      .from('new_people')
      .select('event_id, name, phone, is_primary, role')
      .in('event_id', eventIds)
      .in('role', ['producer', 'coordinator']),
  ])

  const equipmentByEvent = processEquipmentByEvent((ordersResult.data || []) as OrderData[])
  const producerByEvent = processProducersByEvent((producersResult.data || []) as ProducerData[])

  return (data || []).map((op: OperationData) => {
    const equipment = equipmentByEvent.get(op.new_events.id)
    const producer = producerByEvent.get(op.new_events.id)
    const observation = commentByOperation.get(op.id)
    return transformToOperationDisplay(op, equipment, producer, observation)
  })
}


export async function getOperationsByIds(ids: string[]): Promise<OperationDisplay[]> {
  if (ids.length === 0) return []

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('google_id', user.id)
    .single()

  if (!userData?.tenant_id) {
    throw new Error('Tenant not found')
  }

  const { data, error } = await supabase
    .from('new_operations')
    .select(
      `
      id,
      event_id,
      type,
      subtype,
      date,
      time,
      duration,
      driver,
      vehicle,
      helper,
      vehicle_type,
      status,
      notes,
      new_events(
        id,
        number,
        year,
        name,
        location,
        source,
        event_locations(
          formatted_address,
          raw_address
        ),
        new_events_contaazul_pessoas(
          contaazul_pessoas(
            name
          )
        )
      )
    `,
    )
    .in('id', ids)
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (error) {
    throw new Error('Failed to fetch operations by IDs')
  }

  const eventIds = [...new Set((data || []).map((op) => op.new_events.id).filter(Boolean))]
  const operationIds = (data || []).map((op) => op.id)

  const comments = await fetchCommentsForOperations(supabase, operationIds)
  const commentByOperation = processCommentsByOperation(comments)

  if (eventIds.length === 0) {
    return (data || []).map((op: OperationData) => {
      const observation = commentByOperation.get(op.id)
      return transformToOperationDisplay(op, undefined, undefined, observation)
    })
  }

  const [ordersResult, producersResult] = await Promise.all([
    supabase
      .from('new_orders')
      .select(
        `
        event_id,
        number,
        is_cancelled,
        new_order_items(
          description,
          quantity
        )
      `,
      )
      .in('event_id', eventIds),
    supabase
      .from('new_people')
      .select('event_id, name, phone, is_primary, role')
      .in('event_id', eventIds)
      .in('role', ['producer', 'coordinator']),
  ])

  const equipmentByEvent = processEquipmentByEvent((ordersResult.data || []) as OrderData[])
  const producerByEvent = processProducersByEvent((producersResult.data || []) as ProducerData[])

  return (data || []).map((op: OperationData) => {
    const equipment = equipmentByEvent.get(op.new_events.id)
    const producer = producerByEvent.get(op.new_events.id)
    const observation = commentByOperation.get(op.id)
    return transformToOperationDisplay(op, equipment, producer, observation)
  })
}
