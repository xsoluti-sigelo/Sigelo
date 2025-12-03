'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/shared/lib/supabase/client'
import { User } from '@/entities/user'

const AUDIT_LOGIN_FLAG = 'sigelo:audit-login-logged'

async function logAuthAction(action: 'LOGIN' | 'LOGOUT') {
  try {
    await fetch('/api/audit/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        description: action === 'LOGIN' ? 'Usuário autenticado' : 'Usuário saiu (client)',
      }),
    })
  } catch {}
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        sessionStorage.setItem(AUDIT_LOGIN_FLAG, '1')
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_IN') {
        const alreadyLogged = sessionStorage.getItem(AUDIT_LOGIN_FLAG)
        if (!alreadyLogged) {
          await logAuthAction('LOGIN')
          sessionStorage.setItem(AUDIT_LOGIN_FLAG, '1')
        }
      }

      if (event === 'SIGNED_OUT') {
        sessionStorage.removeItem(AUDIT_LOGIN_FLAG)
        await logAuthAction('LOGOUT')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading, isAuthenticated: !!user }
}
