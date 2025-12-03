'use client'

import { Card } from '@/shared/ui'
import { EventWithFinancialData } from './types'
import { getEventTypeLabel, getEventTypeColor } from '../../lib/enum-mappers'

interface RecurrenceTabProps {
  event: EventWithFinancialData
}

export function RecurrenceTab({ event }: RecurrenceTabProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-200 dark:border-gray-700 mb-6">
        Regras de recorrência
      </h2>

      {event.event_type === 'recurring' || event.event_type === 'continuous' ? (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Configurações de recorrência para eventos do tipo{' '}
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}
            >
              {getEventTypeLabel(event.event_type)}
            </span>
          </p>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              As regras de recorrência serão exibidas aqui baseadas nos campos:
            </p>
            <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
              <li>recurrence_type</li>
              <li>recurrence_days (dias da semana)</li>
              <li>recurrence_rule (regra JSON)</li>
              <li>cleaning_rule (configuração de limpeza)</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Este é um evento único, sem regras de recorrência.
          </p>
        </div>
      )}
    </Card>
  )
}
