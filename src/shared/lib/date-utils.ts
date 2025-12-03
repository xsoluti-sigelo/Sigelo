export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  const dateOnlyMatch = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
  if (dateOnlyMatch) {
    const [year, month, day] = dateString.split('-')
    return `${day}/${month}/${year}`
  }
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(timeString: string | null | undefined): string {
  if (!timeString) return '-'
  return timeString.slice(0, 5)
}

export function formatDateForInput(dateString: string | null | undefined): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatTimeForInput(timeString: string | null | undefined): string {
  if (!timeString) return ''
  return timeString.slice(0, 5)
}

export function formatDateToBR(dateStr?: string | null): string {
  if (!dateStr) return 'Nunca'

  try {
    return new Date(dateStr).toLocaleString('pt-BR')
  } catch {
    return 'Data inválida'
  }
}

export function formatDateOnly(dateStr?: string | null): string {
  if (!dateStr) return 'Nunca'

  try {
    return new Date(dateStr).toLocaleDateString('pt-BR')
  } catch {
    return 'Data inválida'
  }
}

export function formatTimeOnly(dateStr?: string | null): string {
  if (!dateStr) return '--:--'

  try {
    return new Date(dateStr).toLocaleTimeString('pt-BR')
  } catch {
    return 'Hora inválida'
  }
}

export function getRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return 'Nunca'

  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSeconds < 60) {
      return 'Agora mesmo'
    }

    if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'} atrás`
    }

    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'} atrás`
    }

    if (diffDays < 30) {
      return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'} atrás`
    }

    return formatDateOnly(dateStr)
  } catch {
    return 'Data inválida'
  }
}

export function isToday(dateStr?: string | null): boolean {
  if (!dateStr) return false

  try {
    const date = new Date(dateStr)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  } catch {
    return false
  }
}

export function isExpired(expiresAt?: number | null): boolean {
  if (!expiresAt) return false
  return expiresAt < Date.now()
}

const BRAZIL_TIMEZONE = 'America/Sao_Paulo'

export function getTodayInBrazil(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: BRAZIL_TIMEZONE })
}

export function getNowInBrazil(): Date {
  const now = new Date()
  const brazilTime = new Date(now.toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE }))
  return brazilTime
}

export function getCurrentYearInBrazil(): number {
  return getNowInBrazil().getFullYear()
}
