import type { User } from '@supabase/supabase-js'

export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Usuário'

  const fullName = user.user_metadata?.full_name
  if (fullName && typeof fullName === 'string') {
    return fullName
  }

  const name = user.user_metadata?.name
  if (name && typeof name === 'string') {
    return name
  }

  return user.email?.split('@')[0] || 'Usuário'
}

export function getUserAvatarUrl(user: User | null): string | null {
  if (!user) return null

  const avatarUrl = user.user_metadata?.avatar_url
  if (avatarUrl && typeof avatarUrl === 'string') {
    return avatarUrl
  }

  const picture = user.user_metadata?.picture
  if (picture && typeof picture === 'string') {
    return picture
  }

  return null
}

export function getUserInitials(user: User | null): string {
  const displayName = getUserDisplayName(user)
  const nameParts = displayName.split(' ').filter(Boolean)

  if (nameParts.length === 0) return 'U'
  if (nameParts.length === 1) return nameParts[0][0].toUpperCase()

  return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
}

export function isAuthenticated(user: User | null): boolean {
  return user !== null
}

export function formatLastLogin(date: string | Date): string {
  const loginDate = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - loginDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Agora mesmo'
  if (diffMins < 60) return `Há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`
  if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`
  if (diffDays < 7) return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`

  return loginDate.toLocaleDateString('pt-BR')
}

export function buildRedirectUrl(baseUrl: string, params?: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl
  }

  const url = new URL(baseUrl, window.location.origin)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  return url.toString()
}
