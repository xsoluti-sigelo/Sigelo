import { redirect } from 'next/navigation'
import { getUser } from '@/features/auth'
import { ROUTES } from '@/shared/config'

export default async function Home() {
  const user = await getUser()

  if (user) {
    redirect(ROUTES.DASHBOARD)
  }

  redirect(ROUTES.LOGIN)
}
