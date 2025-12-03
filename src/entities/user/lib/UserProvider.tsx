'use client'

import { createContext, useContext, useMemo } from 'react'
import type { UserRole } from '../api/helpers'

interface UserContextData {
  userId: string
  tenantId: string
  role: UserRole
  canWrite: boolean
  isAdmin: boolean
}

const UserContext = createContext<UserContextData | null>(null)

export function UserProvider({
  children,
  userData,
}: {
  children: React.ReactNode
  userData: { userId: string; tenantId: string; role: UserRole }
}) {
  const value = useMemo<UserContextData>(
    () => ({
      userId: userData.userId,
      tenantId: userData.tenantId,
      role: userData.role,
      canWrite: userData.role === 'ADMIN' || userData.role === 'OPERATOR',
      isAdmin: userData.role === 'ADMIN',
    }),
    [userData],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
