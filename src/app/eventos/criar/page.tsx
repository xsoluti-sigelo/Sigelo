import { Breadcrumb } from '@/shared/ui'
import { createClient } from '@/shared/lib/supabase/server'
import { EventFormWidget } from '@/widgets/event'
import { redirect } from 'next/navigation'
import { hasWritePermission } from '@/entities/user'
import type { Metadata } from 'next'
import { ROUTES } from '@/shared/config'
import { getTodayInBrazil, getCurrentYearInBrazil } from '@/shared/lib/date-utils'

export const metadata: Metadata = {
  title: 'Criar evento - Eventos - Sigelo',
  description: 'Criar um novo evento no sistema',
}

export default async function CreateEventPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(ROUTES.LOGIN)
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('google_id', user.id)
    .single()

  const userRole = userData?.role

  if (!userRole || !hasWritePermission(userRole)) {
    redirect(ROUTES.EVENTS)
  }

  const currentYear = getCurrentYearInBrazil()
  const today = getTodayInBrazil()

  const defaultMobilizationTime = '07:00'
  const defaultDemobilizationTime = '19:00'

  const initialData = {
    name: '',
    number: '',
    year: currentYear,
    date: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    location: '',
    contract: null,
    client_id: undefined,
    received_date: null,
    is_night_event: null,
    is_intermittent: null,
    mobilization_datetime: `${today}T${defaultMobilizationTime}`,
    demobilization_datetime: `${today}T${defaultDemobilizationTime}`,
    pre_cleaning_datetime: null,
    post_cleaning_datetime: null,
    event_type: null,
    cleaning_rule: null,
    services: [],
    eventServices: [],
    people: [],
    orders: [],
  }

  return (
    <div className="p-8 w-full">
      <div className="max-w-[1600px] mx-auto">
        <Breadcrumb
          items={[{ label: 'Eventos', href: ROUTES.EVENTS }, { label: 'Criar evento' }]}
          className="mb-6"
        />

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Criar evento</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Preencha os dados do novo evento</p>
        </div>

        <EventFormWidget initialData={initialData} />
      </div>
    </div>
  )
}
