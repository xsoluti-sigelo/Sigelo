import { createClient } from '@/shared/lib/supabase/server'

interface UserTenant {
  userId: string
  tenantId: string
  user: {
    id: string
    email?: string
  }
}

interface AuthError {
  success: false
  error: string
}

interface AuthSuccess {
  success: true
  data: UserTenant
}

type AuthResult = AuthSuccess | AuthError

export async function getUserTenant(): Promise<AuthResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: 'Unauthorized - User not authenticated',
    }
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('google_id', user.id)
    .single()

  if (userError || !userData?.tenant_id) {
    return {
      success: false,
      error: 'Tenant not found for user',
    }
  }

  return {
    success: true,
    data: {
      userId: user.id,
      tenantId: userData.tenant_id,
      user: {
        id: user.id,
        email: user.email,
      },
    },
  }
}

export async function requireUserTenant(): Promise<UserTenant> {
  const result = await getUserTenant()

  if (!result.success) {
    throw new Error(result.error)
  }

  return result.data
}
