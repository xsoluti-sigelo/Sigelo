import { redirect } from 'next/navigation'
import { AppLayout } from '@/widgets/AppLayout'
import { Sidebar } from '@/features/sidebar'
import { UserProvider, _getUserDataByGoogleId } from '@/entities/user'
import { createClient } from '@/shared/lib/supabase/server'
import { ROUTES } from '@/shared/config'

export default async function AuditoriaLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(ROUTES.LOGIN)
  }

  const { id, tenant_id, role } = await _getUserDataByGoogleId(user.id)

  if (role !== 'ADMIN') {
    redirect(ROUTES.DASHBOARD)
  }

  return (
    <UserProvider userData={{ userId: id, tenantId: tenant_id, role }}>
      <AppLayout sidebar={<Sidebar user={user} />}>{children}</AppLayout>
    </UserProvider>
  )
}
