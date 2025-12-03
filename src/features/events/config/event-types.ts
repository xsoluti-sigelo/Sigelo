export enum EventType {
  UNIQUE = 'SINGLE_OCCURRENCE',
  INTERMITTENT = 'INTERMITENTE',
  CONTINUOUS = 'CONTINUO',
}

export const EventTypeLabels: Record<EventType, string> = {
  [EventType.UNIQUE]: 'Único',
  [EventType.INTERMITTENT]: 'Intermitente',
  [EventType.CONTINUOUS]: 'Contínuo',
}

export const EventTypeColors: Record<EventType, string> = {
  [EventType.UNIQUE]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  [EventType.INTERMITTENT]: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  [EventType.CONTINUOUS]: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
}

export type EventTypeValue = 'SINGLE_OCCURRENCE' | 'INTERMITENTE' | 'CONTINUO'
export type EventTypeEnum = EventType.UNIQUE | EventType.INTERMITTENT | EventType.CONTINUOUS
