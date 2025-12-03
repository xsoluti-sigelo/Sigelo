'use client'

import { useState } from 'react'
import { Button } from '@/shared/ui'
import { updateEventTime } from '../actions/update-event-time'
import { showSuccessToast, showErrorToast } from '@/shared/lib/toast'

interface TimeEditorProps {
  issueId: string
  eventId: string
  currentValue?: string
  onSaved: () => void
  onCancel: () => void
}

export function TimeEditor({ issueId, eventId, currentValue, onSaved, onCancel }: TimeEditorProps) {
  const parseTime = (timeStr?: string) => {
    if (!timeStr) return { start: '', end: '' }
    const parts = timeStr.split(' - ')
    return {
      start: parts[0]?.replace('h', '') || '',
      end: parts[1]?.replace('h', '') || '',
    }
  }

  const current = parseTime(currentValue)
  const [startTime, setStartTime] = useState(current.start)
  const [endTime, setEndTime] = useState(current.end)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSave = async () => {
    if (!startTime.trim() || !endTime.trim()) {
      showErrorToast('Preencha ambos os horários')
      return
    }

    setIsUpdating(true)
    try {
      const result = await updateEventTime({
        issueId,
        eventId,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
      })

      if (result.success) {
        showSuccessToast(result.message || 'Horários atualizados com sucesso')
        onSaved()
      } else {
        showErrorToast(result.error || 'Erro ao atualizar horários')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado'
      showErrorToast(message)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-medium block mb-1 text-sm">Horário início:</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            placeholder="08:00"
          />
        </div>
        <div>
          <label className="font-medium block mb-1 text-sm">Horário fim:</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            placeholder="17:00"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          isLoading={isUpdating}
          disabled={!startTime || !endTime}
        >
          Salvar Horários
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} disabled={isUpdating}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
