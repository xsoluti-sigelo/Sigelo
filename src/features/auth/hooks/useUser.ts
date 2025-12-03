'use client'

import { useAuth } from './useAuth'

export function useUser() {
  const { user, loading } = useAuth()

  return {
    user,
    loading,
    email: user?.email,
    id: user?.id,
    metadata: user?.user_metadata,
  }
}
