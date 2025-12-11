import { EventStatus, EventStatusLabels } from '@/features/events/config/event-status'
import { EventType, EventTypeLabels } from '@/features/events/config/event-types'
import { enumToSelectOptions } from '@/shared/config/enums'

export interface FilterOption {
  value: string
  label: string
}

export function getEventStatusFilterOptions(): FilterOption[] {
  return [
    { value: '', label: 'Todos os status' },
    ...enumToSelectOptions(EventStatus, EventStatusLabels),
  ]
}

export function getEventTypeFilterOptions(): FilterOption[] {
  return [
    { value: '', label: 'Todos os tipos' },
    ...enumToSelectOptions(EventType, EventTypeLabels).filter(
      (option) => option.value !== EventType.CONTINUOUS
    ),
  ]
}
