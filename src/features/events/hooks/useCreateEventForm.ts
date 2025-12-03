'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { DocumentFile } from '@/features/documents/types'
import { formatPhone } from '@/shared/lib/masks'
import { ROUTES } from '@/shared/config'
import { useAddressByCep } from '@/features/integrations/viacep'
import { EventType as EventTypeEnum } from '@/features/events/config/event-types'

const EVENT_TYPE_SINGLE = EventTypeEnum.UNIQUE
const EVENT_TYPE_INTERMITTENT = EventTypeEnum.INTERMITTENT
const EVENT_TYPE_CONTINUOUS = EventTypeEnum.CONTINUOUS
const EVENT_TYPE_LEGACY_UNICO = 'UNICO'

interface OrderItem {
  description: string
  quantity: number
  days: number
  unit_price: number
  item_total: number
  service_id?: string
}

interface Order {
  number: string
  date: string
  total_value: number
  is_cancelled: boolean
  items: OrderItem[]
}

interface Person {
  name: string
  role: 'producer' | 'coordinator'
  phone: string | null
  is_primary?: boolean
}

interface EventService {
  contaazul_service_id: string
  quantity: number
  unit_price: number
  daily_rate: number
  total_price: number
  notes?: string
  order_id?: string
}

type EventType = 'SINGLE_OCCURRENCE' | 'UNICO' | 'INTERMITENTE' | 'CONTINUO' | null
type DayOfWeek = 'DOM' | 'SEG' | 'TER' | 'QUA' | 'QUI' | 'SEX' | 'SAB'

interface CleaningRule {
  type: 'daily' | 'weekly'
  daysOfWeek?: DayOfWeek[]
  time: string
}

interface UseCreateEventFormProps {
  initialData: {
    name: string
    number: string
    year: number
    date: string
    start_date?: string
    end_date?: string
    start_time: string
    end_time: string
    location: string
    contract: string | null
    client_id?: string
    received_date?: string | null
    is_night_event?: boolean | null
    is_intermittent?: boolean | null
    mobilization_datetime?: string | null
    demobilization_datetime?: string | null
    pre_cleaning_datetime?: string | null
    post_cleaning_datetime?: string | null
    event_type?: EventType
    cleaning_rule?: CleaningRule | null
    services?: string[]
    eventServices?: EventService[]
    people?: Person[]
    orders?: Order[]
  }
}

export function useCreateEventForm({ initialData }: UseCreateEventFormProps) {
  const router = useRouter()

  const [name, setName] = useState(initialData.name)
  const [number, setNumber] = useState(initialData.number)
  const [year, setYear] = useState(initialData.year)
  const [date, setDate] = useState(initialData.date)
  const [startDate, setStartDate] = useState(initialData.start_date || initialData.date)
  const [endDate, setEndDate] = useState(initialData.end_date || initialData.date)
  const [startTime, setStartTime] = useState(initialData.start_time)
  const [endTime, setEndTime] = useState(initialData.end_time)
  const [location, setLocation] = useState(initialData.location)
  const [contract, setContract] = useState(initialData.contract || '')
  const [clientId, setClientId] = useState(initialData.client_id || '')
  const [receivedDate, setReceivedDate] = useState(initialData.received_date || '')
  const [isNightEvent, setIsNightEvent] = useState(initialData.is_night_event ?? false)
  const [isIntermittent, setIsIntermittent] = useState(initialData.is_intermittent ?? false)
  const [mobilizationDatetime, setMobilizationDatetime] = useState(
    initialData.mobilization_datetime || '',
  )
  const [demobilizationDatetime, setDemobilizationDatetime] = useState(
    initialData.demobilization_datetime || '',
  )

  const [eventType, setEventType] = useState<EventType>(initialData.event_type || null)
  const [cleaningDaysOfWeek, setCleaningDaysOfWeek] = useState<DayOfWeek[]>(
    initialData.cleaning_rule?.daysOfWeek || [],
  )
  const [cleaningTime, setCleaningTime] = useState(initialData.cleaning_rule?.time || '19:00')

  const [people, setPeople] = useState<Person[]>(
    initialData.people?.map((p) => ({
      ...p,
      phone: p.phone ? formatPhone(p.phone) : null,
    })) || [],
  )
  const [orders, setOrders] = useState<Order[]>(initialData.orders || [])
  const [eventServices, setEventServices] = useState<EventService[]>(
    initialData.eventServices || [],
  )

  const [attachedDocuments, setAttachedDocuments] = useState<DocumentFile[]>([])

  const [postalCode, setPostalCode] = useState('')
  const [street, setStreet] = useState('')
  const [locationNumber, setLocationNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [locationState, setLocationState] = useState('')
  const [rawAddress, setRawAddress] = useState(initialData.location)

  const { data: addressData, error: addressError } = useAddressByCep(postalCode)

  useEffect(() => {
    if (addressData) {
      setStreet(addressData.street)
      setNeighborhood(addressData.neighborhood)
      setCity(addressData.city)
      setLocationState(addressData.state)
      const fullAddress = `${addressData.street}, ${locationNumber || ''} - ${addressData.neighborhood}, ${addressData.city} - ${addressData.state}`
      setRawAddress(fullAddress)
    }
  }, [addressData, locationNumber])

  useEffect(() => {
    if (addressError) {
      toast.error(addressError.message || 'Erro ao buscar endereço pelo CEP')
    }
  }, [addressError])

  useEffect(() => {
    if (mobilizationDatetime) {
      const [mobDate, mobTime] = mobilizationDatetime.split('T')
      if (mobDate && mobDate !== startDate) {
        setStartDate(mobDate)
      }
      if (mobTime) {
        const formattedTime = `${mobTime}:00`
        if (formattedTime !== startTime) {
          setStartTime(formattedTime)
        }
      }
    }
    if (demobilizationDatetime) {
      const [demobDate, demobTime] = demobilizationDatetime.split('T')
      if (demobDate && demobDate !== endDate) {
        setEndDate(demobDate)
      }
      if (demobTime) {
        const formattedTime = `${demobTime}:00`
        if (formattedTime !== endTime) {
          setEndTime(formattedTime)
        }
      }
    }
  }, [mobilizationDatetime, demobilizationDatetime, startDate, endDate, startTime, endTime])

  useEffect(() => {
    const newOrders = orders.map((order) => ({
      ...order,
      total_value: order.items.reduce((sum, item) => sum + item.item_total, 0),
    }))
    if (JSON.stringify(newOrders) !== JSON.stringify(orders)) {
      setOrders(newOrders)
    }
  }, [orders])

  useEffect(() => {
    if (!startDate || !endDate) return

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (end < start) return

    const diffTime = Math.abs(end.getTime() - start.getTime())
    const calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    setOrders((prevOrders) =>
      prevOrders.map((order) => ({
        ...order,
        items: order.items.map((item) => ({
          ...item,
          days: calculatedDays,
          item_total: item.quantity * calculatedDays * item.unit_price,
        })),
      })),
    )
  }, [startDate, endDate])

  const addPerson = (role: 'producer' | 'coordinator') => {
    setPeople([...people, { name: '', role, phone: null, is_primary: false }])
  }

  const removePerson = (index: number) => {
    setPeople(people.filter((_, i) => i !== index))
  }

  const updatePerson = (index: number, field: keyof Person, value: string | boolean) => {
    const newPeople = [...people]
    newPeople[index] = { ...newPeople[index], [field]: value }
    setPeople(newPeople)
  }

  const toggleCleaningDay = (day: DayOfWeek) => {
    setCleaningDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    )
  }

  const getAvailableWeekdays = (): DayOfWeek[] => {
    if (!startDate || !endDate) return []

    const daysMap: Record<number, DayOfWeek> = {
      0: 'DOM',
      1: 'SEG',
      2: 'TER',
      3: 'QUA',
      4: 'QUI',
      5: 'SEX',
      6: 'SAB',
    }

    const start = new Date(startDate + 'T00:00:00')
    const end = new Date(endDate + 'T00:00:00')
    const availableDays = new Set<DayOfWeek>()

    const current = new Date(start)
    while (current <= end) {
      const dayOfWeek = daysMap[current.getDay()]
      availableDays.add(dayOfWeek)
      current.setDate(current.getDate() + 1)
    }

    return Array.from(availableDays)
  }

  const calculateCurrentDays = (): number => {
    if (!startDate || !endDate) return 1

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (end < start) return 1

    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const addOrder = () => {
    const today = new Date().toISOString().split('T')[0]
    const calculatedDays = calculateCurrentDays()

    setOrders([
      ...orders,
      {
        number: '',
        date: today,
        total_value: 0,
        is_cancelled: false,
        items: [
          {
            description: '',
            quantity: 1,
            days: calculatedDays,
            unit_price: 0,
            item_total: 0,
            service_id: undefined,
          },
        ],
      },
    ])
  }

  const removeOrder = (index: number) => {
    setOrders(orders.filter((_, i) => i !== index))
  }

  const updateOrder = (index: number, field: keyof Order, value: string | number | boolean) => {
    const newOrders = [...orders]
    newOrders[index] = { ...newOrders[index], [field]: value }
    setOrders(newOrders)
  }

  const addOrderItem = (orderIndex: number) => {
    const calculatedDays = calculateCurrentDays()
    const newOrders = [...orders]
    newOrders[orderIndex].items.push({
      description: '',
      quantity: 1,
      days: calculatedDays,
      unit_price: 0,
      item_total: 0,
      service_id: undefined,
    })
    setOrders(newOrders)
  }

  const removeOrderItem = (orderIndex: number, itemIndex: number) => {
    const newOrders = [...orders]
    newOrders[orderIndex].items = newOrders[orderIndex].items.filter((_, i) => i !== itemIndex)

    const orderTotal = newOrders[orderIndex].items.reduce((sum, item) => sum + item.item_total, 0)
    newOrders[orderIndex].total_value = orderTotal

    setOrders(newOrders)
  }

  const updateOrderItem = (
    orderIndex: number,
    itemIndex: number,
    field: keyof OrderItem,
    value: string | number,
  ) => {
    const newOrders = [...orders]
    const item = { ...newOrders[orderIndex].items[itemIndex], [field]: value }

    if (field === 'quantity' || field === 'days' || field === 'unit_price') {
      item.item_total = item.quantity * item.days * item.unit_price
    }

    newOrders[orderIndex].items[itemIndex] = item

    const orderTotal = newOrders[orderIndex].items.reduce((sum, item) => sum + item.item_total, 0)
    newOrders[orderIndex].total_value = orderTotal

    setOrders(newOrders)
  }

  const updateOrderItemWithService = (
    orderIndex: number,
    itemIndex: number,
    field: keyof OrderItem,
    value: string | number,
    servicos: Array<{ id: string; rate?: number }>,
  ) => {
    const newOrders = [...orders]
    const item = { ...newOrders[orderIndex].items[itemIndex], [field]: value }

    if (field === 'service_id' && value) {
      const selectedService = servicos.find((s) => s.id === value)
      if (selectedService && selectedService.rate) {
        item.unit_price = selectedService.rate
        item.item_total = item.quantity * item.days * item.unit_price
      }
    }

    if (field === 'quantity' || field === 'days' || field === 'unit_price') {
      item.item_total = item.quantity * item.days * item.unit_price
    }

    newOrders[orderIndex].items[itemIndex] = item

    const orderTotal = newOrders[orderIndex].items.reduce((sum, item) => sum + item.item_total, 0)
    newOrders[orderIndex].total_value = orderTotal

    setOrders(newOrders)
  }

  const getFormData = async () => {
    let cleaningRule: CleaningRule | null = null

    if ((eventType === EVENT_TYPE_SINGLE || eventType === EVENT_TYPE_LEGACY_UNICO) && cleaningTime) {
      cleaningRule = {
        type: 'daily',
        time: cleaningTime,
      }
    } else if (eventType === EVENT_TYPE_INTERMITTENT && cleaningDaysOfWeek.length > 0 && cleaningTime) {
      cleaningRule = {
        type: 'weekly',
        daysOfWeek: cleaningDaysOfWeek,
        time: cleaningTime,
      }
    } else if (eventType === EVENT_TYPE_CONTINUOUS && cleaningDaysOfWeek.length > 0 && cleaningTime) {
      cleaningRule = {
        type: 'weekly',
        daysOfWeek: cleaningDaysOfWeek,
        time: cleaningTime,
      }
    }

    let attachments = undefined
    if (attachedDocuments.length > 0) {
      attachments = await Promise.all(
        attachedDocuments.map(async (doc) => {
          return new Promise<{
            fileName: string
            fileData: string
            fileType: string
            fileSize: number
          }>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              resolve({
                fileName: doc.file.name,
                fileData: reader.result as string,
                fileType: doc.file.type,
                fileSize: doc.file.size,
              })
            }
            reader.onerror = () => {
              reject(new Error(`Erro ao ler arquivo: ${doc.file.name}`))
            }
            reader.readAsDataURL(doc.file)
          })
        }),
      )
    }

    const mobilizationDatetimeValue = mobilizationDatetime || null
    const demobilizationDatetimeValue = demobilizationDatetime || null

    let calculatedStartDate = startDate
    let calculatedStartTime = startTime
    let calculatedEndDate = endDate
    let calculatedEndTime = endTime

    if (mobilizationDatetimeValue) {
      const [mobDate, mobTime] = mobilizationDatetimeValue.split('T')
      if (mobDate && mobTime) {
        calculatedStartDate = mobDate
        calculatedStartTime = `${mobTime}:00`
      }
    }

    if (demobilizationDatetimeValue) {
      const [demobDate, demobTime] = demobilizationDatetimeValue.split('T')
      if (demobDate && demobTime) {
        calculatedEndDate = demobDate
        calculatedEndTime = `${demobTime}:00`
      }
    }

    const normalizeOrders = (): Order[] => {
      if (orders.length === 0) {
        return []
      }

      const aggregatedItems = orders.flatMap((order) => order.items.map((item) => ({ ...item })))
      const aggregatedTotal = aggregatedItems.reduce((sum, item) => sum + item.item_total, 0)

      const baseOrder = orders[0]

      return [
        {
          ...baseOrder,
          items: aggregatedItems,
          total_value: aggregatedTotal,
        },
      ]
    }

    const formData = {
      name,
      number,
      year,
      date: calculatedStartDate || null,
      start_date: calculatedStartDate || null,
      end_date: calculatedEndDate || null,
      start_time: calculatedStartTime || null,
      end_time: calculatedEndTime || null,
      location: rawAddress,
      contract: contract || null,
      client_id: clientId || undefined,
      received_date: receivedDate || null,
      is_night_event: isNightEvent,
      is_intermittent: isIntermittent,
      mobilization_datetime: mobilizationDatetimeValue,
      demobilization_datetime: demobilizationDatetimeValue,
      pre_cleaning_datetime: null,
      post_cleaning_datetime: null,
      event_type: eventType,
      cleaning_rule: cleaningRule,
      people,
      orders: normalizeOrders(),
      eventServices,
      attachments,
      locationData: {
        raw_address: rawAddress,
        street: street || null,
        number: locationNumber || null,
        complement: complement || null,
        neighborhood: neighborhood || null,
        city: city || null,
        state: locationState || null,
        postal_code: postalCode || null,
      },
    }

    return formData
  }

  const handleSaveSuccess = (eventId: string) => {
    toast.success('Evento criado com sucesso!')
    router.push(ROUTES.EVENT_DETAILS(eventId))
    router.refresh()
  }

  const handleSaveError = (error: string) => {
    toast.error(error || 'Erro ao criar evento')
  }

  return {
    formState: {
      name,
      number,
      year,
      date,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      contract,
      clientId,
      receivedDate,
      isNightEvent,
      isIntermittent,
      mobilizationDatetime,
      demobilizationDatetime,
      eventType,
      cleaningDaysOfWeek,
      cleaningTime,
      people,
      orders,
      eventServices,
      postalCode,
      street,
      locationNumber,
      complement,
      neighborhood,
      city,
      locationState,
      rawAddress,
      attachedDocuments,
    },
    setters: {
      setName,
      setNumber,
      setYear,
      setDate,
      setStartDate,
      setEndDate,
      setStartTime,
      setEndTime,
      setLocation,
      setContract,
      setClientId,
      setReceivedDate,
      setIsNightEvent,
      setIsIntermittent,
      setMobilizationDatetime,
      setDemobilizationDatetime,
      setEventType,
      setCleaningDaysOfWeek,
      setCleaningTime,
      setPostalCode,
      setStreet,
      setLocationNumber,
      setComplement,
      setNeighborhood,
      setCity,
      setLocationState,
      setRawAddress,
      setAttachedDocuments,
      setPeople,
      setOrders,
      setEventServices,
    },
    actions: {
      addPerson,
      removePerson,
      updatePerson,
      addOrder,
      removeOrder,
      updateOrder,
      addOrderItem,
      removeOrderItem,
      updateOrderItem,
      updateOrderItemWithService,
      toggleCleaningDay,
      getAvailableWeekdays,
      getFormData,
      handleSaveSuccess,
      handleSaveError,
    },
  }
}
