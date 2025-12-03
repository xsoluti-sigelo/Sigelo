export const CALENDAR_COLORS = {
  TEAL: '#14b8a6',
  PURPLE: '#a855f7',
  ORANGE: '#f97316',
  DEFAULT: '#3174ad',
  TEXT: 'white',
} as const

export const CALENDAR_MESSAGES = {
  next: 'Próximo',
  previous: 'Anterior',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'Não há eventos neste período',
  showMore: (total: number) => `+${total} mais`,
} as const

export const CALENDAR_CULTURE = 'pt-BR' as const
