'use client'

import { useState } from 'react'
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PencilIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/shared/ui'
import { useIssues } from '../hooks'
import { updateIssueValue } from '../actions'
import { showSuccessToast, showErrorToast } from '@/shared/lib/toast'
import { TimeEditor } from './TimeEditor'
import { LocationEditor } from './LocationEditor'
import type { Issue } from '../types'
import { SEVERITY_LABELS, SEVERITY_COLORS, ISSUE_TYPE_LABELS } from '../config'
import { usePermissions } from '@/features/auth/hooks/usePermissions'

interface IssueAlertProps {
  issue: Issue
  eventId: string
  onResolved?: () => void
}

export function IssueAlert({ issue, eventId, onResolved }: IssueAlertProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(issue.current_value || '')
  const [isUpdating, setIsUpdating] = useState(false)
  const { hasWritePermission } = usePermissions()

  const { handleResolve, handleIgnore, isProcessing, isPending } = useIssues({
    onSuccess: () => {
      onResolved?.()
    },
  })

  const severityConfig = SEVERITY_COLORS[issue.severity]
  const canEdit =
    hasWritePermission && issue.field_affected && ['incomplete_address', 'invalid_time'].includes(issue.type)

  const handleSaveEdit = async () => {
    if (!issue.field_affected || !editValue.trim()) {
      showErrorToast('Valor inválido')
      return
    }

    setIsUpdating(true)
    try {
      const result = await updateIssueValue({
        issueId: issue.id,
        eventId,
        fieldName: issue.field_affected,
        newValue: editValue,
        autoResolve: true,
      })

      if (result.success) {
        showSuccessToast(result.message || 'Atualizado com sucesso')
        setIsEditing(false)
        onResolved?.()
      } else {
        showErrorToast(result.error || 'Erro ao atualizar')
      }
    } catch {
      showErrorToast('Erro inesperado ao atualizar')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div
      className={`relative border-l-4 ${severityConfig.border} bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full ${severityConfig.bg} flex items-center justify-center`}
          >
            <ExclamationTriangleIcon className={`w-5 h-5 ${severityConfig.text}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityConfig.bg} ${severityConfig.text}`}
              >
                {SEVERITY_LABELS[issue.severity]}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {ISSUE_TYPE_LABELS[issue.type] || issue.type}
              </span>
            </div>

            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {issue.message}
            </h4>

            {issue.field_affected && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">Campo:</span>
                  <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
                    {issue.field_affected}
                  </code>
                </div>

                {isEditing ? (
                  issue.type === 'invalid_time' ? (
                    <TimeEditor
                      issueId={issue.id}
                      eventId={eventId}
                      currentValue={issue.current_value || undefined}
                      onSaved={() => {
                        setIsEditing(false)
                        onResolved?.()
                      }}
                      onCancel={() => setIsEditing(false)}
                    />
                  ) : issue.type === 'incomplete_address' ? (
                    <LocationEditor
                      issueId={issue.id}
                      eventId={eventId}
                      currentValue={issue.current_value || undefined}
                      onSaved={() => {
                        setIsEditing(false)
                        onResolved?.()
                      }}
                      onCancel={() => setIsEditing(false)}
                    />
                  ) : (
                    <div className="space-y-3 mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Novo valor
                        </label>
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Digite o novo valor"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          isLoading={isUpdating}
                          disabled={!editValue.trim()}
                        >
                          Salvar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false)
                            setEditValue(issue.current_value || '')
                          }}
                          disabled={isUpdating}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="space-y-2">
                    {issue.current_value && (
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-gray-600 dark:text-gray-400 font-medium min-w-[100px]">
                          Valor atual:
                        </span>
                        <code className="flex-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-100 font-mono text-xs">
                          {issue.current_value}
                        </code>
                      </div>
                    )}
                    {issue.suggested_value && (
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-gray-600 dark:text-gray-400 font-medium min-w-[100px]">
                          Sugestão:
                        </span>
                        <span className="flex-1 text-gray-700 dark:text-gray-300 italic">
                          {issue.suggested_value}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {!isEditing && hasWritePermission && (
            <div className="flex flex-col gap-2 flex-shrink-0">
              {canEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  disabled={isPending}
                  className="whitespace-nowrap"
                >
                  <PencilIcon className="w-4 h-4 mr-1.5" />
                  Corrigir
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => handleResolve(issue.id, eventId)}
                isLoading={isProcessing(issue.id)}
                disabled={isPending}
                className="whitespace-nowrap bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                Está OK
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleIgnore(issue.id, eventId)}
                isLoading={isProcessing(issue.id)}
                disabled={isPending}
                className="whitespace-nowrap text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <XMarkIcon className="w-4 h-4 mr-1.5" />
                Ignorar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
