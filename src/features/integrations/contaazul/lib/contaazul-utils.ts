import type { ContaAzulTokens } from '../types/contaazul.types'

export function isContaAzulTokenExpired(tokens: ContaAzulTokens): boolean {
  if (!tokens.expires_at) return true
  const now = Date.now()
  const buffer = 5 * 60 * 1000 // 5 minutes buffer
  return now >= tokens.expires_at - buffer
}

export function getTokenTimeRemaining(tokens: ContaAzulTokens): number {
  if (!tokens.expires_at) return 0
  const now = Date.now()
  const remaining = tokens.expires_at - now
  return Math.max(0, remaining)
}

export function formatTokenTimeRemaining(tokens: ContaAzulTokens): string {
  const remaining = getTokenTimeRemaining(tokens)

  if (remaining === 0) {
    return 'Expirado'
  }

  const seconds = Math.floor(remaining / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} ${days === 1 ? 'dia' : 'dias'}`
  }

  if (hours > 0) {
    const remainingMinutes = minutes % 60
    if (remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}min`
    }
    return `${hours} ${hours === 1 ? 'hora' : 'horas'}`
  }

  if (minutes > 0) {
    const remainingSeconds = seconds % 60
    if (remainingSeconds > 0 && minutes < 5) {
      return `${minutes}min ${remainingSeconds}s`
    }
    return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
  }

  return `${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}`
}

export function getTokenExpirationStatus(tokens: ContaAzulTokens): {
  status: 'expired' | 'expiring-soon' | 'valid'
  color: 'red' | 'yellow' | 'green'
  message: string
} {
  const remaining = getTokenTimeRemaining(tokens)

  if (remaining === 0) {
    return {
      status: 'expired',
      color: 'red',
      message: 'Token expirado',
    }
  }

  const minutes = Math.floor(remaining / 1000 / 60)

  if (minutes < 10) {
    return {
      status: 'expiring-soon',
      color: 'red',
      message: `Expira em ${formatTokenTimeRemaining(tokens)}`,
    }
  }

  if (minutes < 30) {
    return {
      status: 'expiring-soon',
      color: 'yellow',
      message: `Expira em ${formatTokenTimeRemaining(tokens)}`,
    }
  }

  return {
    status: 'valid',
    color: 'green',
    message: `Válido por ${formatTokenTimeRemaining(tokens)}`,
  }
}
