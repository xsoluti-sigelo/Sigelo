'use client'

import { Card } from '@/shared/ui'
import { EventWithFinancialData } from './types'

interface CleaningTabProps {
  event: EventWithFinancialData
}

const weekdayLabels = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export function CleaningTab({ event }: CleaningTabProps) {
  const shouldShow =
    event.event_type === 'unique' ||
    event.event_type === 'intermittent' ||
    event.event_type === 'recurring'

  if (!shouldShow) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Configuração de limpezas disponível apenas para eventos Único ou Intermitente.
          </p>
        </div>
      </Card>
    )
  }

  const cleaningRule = event.cleaning_rule
  const weekdays = cleaningRule?.weekdays || []
  const cleaningTime = cleaningRule?.time || ''

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-200 dark:border-gray-700 mb-6">
        Configuração de limpezas
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Dias da Semana Selecionados
          </label>
          {weekdays.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {weekdays.map((day) => (
                <span
                  key={day}
                  className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  {weekdayLabels[day] || `Dia ${day}`}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Nenhum dia da semana configurado
            </p>
          )}
        </div>

        {cleaningTime && (
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Horário de Limpeza
            </label>
            <p className="text-base text-gray-900 dark:text-gray-100 font-mono">{cleaningTime}</p>
          </div>
        )}

        {weekdays.length === 0 && !cleaningTime && (
          <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              Nenhuma configuração de limpeza encontrada
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Configure os dias da semana e horários na edição do evento
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
