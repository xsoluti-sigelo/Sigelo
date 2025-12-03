import { createClient } from '@/shared/lib/supabase/client'
import type { Session } from '@supabase/supabase-js'

export class AuthSessionService {
  private supabase = createClient()

  async getCurrentSession(): Promise<Session | null> {
    const {
      data: { session },
    } = await this.supabase.auth.getSession()
    return session
  }

  async refreshSession(): Promise<Session | null> {
    const {
      data: { session },
    } = await this.supabase.auth.refreshSession()
    return session
  }

  async isSessionValid(): Promise<boolean> {
    const session = await this.getCurrentSession()
    if (!session) return false

    const expiresAt = session.expires_at
    if (!expiresAt) return false

    const now = Math.floor(Date.now() / 1000)
    return expiresAt > now
  }

  async getSessionExpiresIn(): Promise<number | null> {
    const session = await this.getCurrentSession()
    if (!session?.expires_at) return null

    const now = Math.floor(Date.now() / 1000)
    return session.expires_at - now
  }

  shouldRefreshSession(expiresIn: number): boolean {
    const fiveMinutes = 5 * 60
    return expiresIn < fiveMinutes
  }
}

export const authSessionService = new AuthSessionService()
