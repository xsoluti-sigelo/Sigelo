'use client'

import { useState } from 'react'
import { createClient } from '@/shared/lib/supabase/client'

export function useGoogleSignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (signInError) throw signInError
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
      setIsLoading(false)
    }
  }

  return { signIn, isLoading, error }
}
