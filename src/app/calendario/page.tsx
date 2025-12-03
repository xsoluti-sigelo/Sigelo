import { Breadcrumb } from '@/shared/ui'
import { CalendarView } from '@/features/calendar'

export default function CalendarioPage() {
  return (
    <div className="p-8 w-full">
      <div className="max-w-[1600px] mx-auto">
        <Breadcrumb items={[{ label: 'Calendário' }]} className="mb-6" />

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Calendário</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Visualize as operações em calendário
        </p>

        <CalendarView />
      </div>
    </div>
  )
}
