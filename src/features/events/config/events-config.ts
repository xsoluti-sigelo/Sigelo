export { EventType, EventTypeLabels, EventTypeColors } from './event-types'
export type { EventTypeValue, EventTypeEnum } from './event-types'

export { EventStatus, EventStatusLabels, EventStatusColors } from './event-status'
export type { EventStatusValue, EventStatusEnum } from './event-status'

export enum EventSource {
  EMAIL = 'EMAIL',
  MANUAL = 'MANUAL',
  NOT_LISTABLE = 'NOT_LISTABLE',
}

export const EventSourceLabels: Record<EventSource, string> = {
  [EventSource.EMAIL]: 'E-mail',
  [EventSource.MANUAL]: 'Manual',
  [EventSource.NOT_LISTABLE]: 'Não listável',
}

export type DayOfWeek = 'DOM' | 'SEG' | 'TER' | 'QUA' | 'QUI' | 'SEX' | 'SAB'

export const DayOfWeekLabels: Record<DayOfWeek, string> = {
  DOM: 'Domingo',
  SEG: 'Segunda',
  TER: 'Terça',
  QUA: 'Quarta',
  QUI: 'Quinta',
  SEX: 'Sexta',
  SAB: 'Sábado',
}

export type CleaningRuleType = 'daily' | 'weekly' | 'custom'

export interface CleaningRule {
  type: CleaningRuleType
  daysOfWeek?: DayOfWeek[]
  time: string
  preUse?: boolean
  postUse?: boolean
}
