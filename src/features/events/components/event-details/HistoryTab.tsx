'use client'

import { Card } from '@/shared/ui'
import type { EventChangeLogRecord } from '@/entities/event-change-log'
import {
  PencilSquareIcon,
  PlusCircleIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  UserIcon,
  TruckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

interface HistoryTabProps {
  historyLogs: EventChangeLogRecord[]
}

type JsonObject = Record<string, unknown>

const ENTITY_LABELS: Record<string, string> = {
  EVENT: 'Evento',
  OPERATION: 'Operação',
}

const ACTION_LABELS: Record<string, string> = {
  CREATED: 'Criado',
  UPDATED: 'Atualizado',
  STATUS_CHANGED: 'Status atualizado',
  DELETED: 'Removido',
}

const OPERATION_TYPE_LABELS: Record<string, string> = {
  MOBILIZATION: 'Mobilização',
  DEMOBILIZATION: 'Desmobilização',
  CLEANING: 'Limpeza',
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Agendado',
  RECEIVED: 'Recebido',
  VERIFIED: 'Verificado',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  INCOMPLETE: 'Incompleto',
  TIME_ERROR: 'Erro de horário',
  ACTIVE: 'Ativo',
  CONFIRMED: 'Confirmado',
  BILLED: 'Faturado',
  DRAFT: 'Rascunho',
}

const formatLabel = (text?: string | null, dictionary?: Record<string, string>) => {
  if (!text) return null
  const upper = text.toUpperCase()
  if (dictionary && dictionary[upper]) {
    return dictionary[upper]
  }
  return text.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

const formatJson = (value: EventChangeLogRecord['old_value']) => {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string') return value
  return JSON.stringify(value, null, 2)
}

const formatPlainValue = (value: EventChangeLogRecord['old_value']) => {
  if (value === null || value === undefined) {
    return 'vazio'
  }

  if (typeof value === 'string') {
    const upper = value.toUpperCase()
    if (STATUS_LABELS[upper]) {
      return STATUS_LABELS[upper]
    }
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return formatJson(value)
}

const extractNumber = (value: EventChangeLogRecord['old_value'], key: string) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const raw = (value as JsonObject)[key]
    if (typeof raw === 'number') return raw
  }
  return undefined
}

const isMolideRegenerationLog = (log: EventChangeLogRecord) =>
  log.entity === 'OPERATION' && log.context && typeof log.context === 'object'
    ? (log.context as JsonObject)['reason'] === 'molide_regeneration'
    : false

const buildSummary = (log: EventChangeLogRecord, actor: string) => {
  const contextObject =
    log.context && typeof log.context === 'object' && !Array.isArray(log.context)
      ? (log.context as JsonObject)
      : null
  const reason = contextObject?.reason as string | undefined
  const mode = contextObject?.mode as string | undefined

  const operationLabel = log.operation?.type
    ? `operação de ${OPERATION_TYPE_LABELS[log.operation.type] || log.operation.type}`
    : 'operação'

  if (reason === 'invoice_generated') {
    const ofRaw = contextObject?.of_numbers
    const ofNumbers = Array.isArray(ofRaw) ? (ofRaw as unknown as string[]) : []
    const invoiceNumber =
      typeof contextObject?.invoice_number === 'number'
        ? (contextObject.invoice_number as number)
        : undefined
    const descriptor = ofNumbers.length > 0 ? `das OF ${ofNumbers.join(', ')}` : 'do evento'
    const invoiceText = invoiceNumber ? ` (NF ${invoiceNumber})` : ''
    return `${actor} gerou a fatura ${descriptor}${invoiceText}`
  }

  if (reason === 'assign_driver') {
    const driverName =
      log.new_value !== null && log.new_value !== undefined
        ? formatPlainValue(log.new_value)
        : log.old_value
          ? formatPlainValue(log.old_value)
          : 'motorista'

    if (mode === 'update') {
      return `${actor} alterou o motorista da ${operationLabel} para ${driverName}`
    }

    return `${actor} adicionou o motorista ${driverName} à ${operationLabel}`
  }

  if (reason === 'remove_driver') {
    const driverName =
      log.old_value !== null && log.old_value !== undefined
        ? formatPlainValue(log.old_value)
        : 'motorista'
    return `${actor} removeu o motorista ${driverName} da ${operationLabel}`
  }

  if (reason === 'assign_vehicle') {
    const vehicleName =
      log.new_value !== null && log.new_value !== undefined
        ? formatPlainValue(log.new_value)
        : 'veículo'

    if (mode === 'update') {
      return `${actor} alterou o veículo da ${operationLabel} para ${vehicleName}`
    }

    return `${actor} adicionou o veículo ${vehicleName} à ${operationLabel}`
  }

  if (reason === 'remove_vehicle') {
    const vehicleName =
      log.old_value !== null && log.old_value !== undefined
        ? formatPlainValue(log.old_value)
        : 'veículo'
    return `${actor} removeu o veículo ${vehicleName} da ${operationLabel}`
  }

  const molideRegeneration = isMolideRegenerationLog(log)

  if (molideRegeneration) {
    const generated = extractNumber(log.new_value, 'generated_operations')
    const total = extractNumber(log.new_value, 'total_operations')
    const generator =
      log.context && typeof log.context === 'object'
        ? (log.context as JsonObject)['generator']
        : undefined

    const generatorText =
      typeof generator === 'string'
        ? generator === 'edge_function'
          ? 'via Edge Function'
          : 'manualmente'
        : undefined

    const pieces = [
      `${actor} regenerou as operações MOLIDE`,
      generated !== undefined ? `${generated} novas` : undefined,
      total !== undefined ? `(${total} no total)` : undefined,
      generatorText ? `(${generatorText})` : undefined,
    ].filter(Boolean)

    return pieces.join(' ')
  }

  const fieldLabel = formatLabel(log.field)
  const hasOldValue = log.old_value !== undefined && log.old_value !== null
  const hasNewValue = log.new_value !== undefined && log.new_value !== null
  const oldValueText = hasOldValue ? formatPlainValue(log.old_value) : null
  const newValueText = hasNewValue ? formatPlainValue(log.new_value) : null

  if (fieldLabel) {
    if (hasOldValue && hasNewValue) {
      return `${actor} alterou ${fieldLabel} de ${oldValueText} para ${newValueText}`
    }

    if (!hasOldValue && hasNewValue) {
      return `${actor} definiu ${fieldLabel} como ${newValueText}`
    }

    if (hasOldValue && !hasNewValue) {
      return `${actor} removeu ${fieldLabel} (antes: ${oldValueText})`
    }

    return `${actor} atualizou ${fieldLabel}`
  }

  const actionLabel = formatLabel(log.action, ACTION_LABELS) || 'Atualizou'
  const entityLabel = formatLabel(log.entity, ENTITY_LABELS)
  if (entityLabel) {
    return `${actor} ${actionLabel?.toLowerCase() || 'atualizou'} ${entityLabel.toLowerCase()}`
  }

  return `${actor} realizou ${actionLabel?.toLowerCase() || 'atualizações'}`
}

const getActionIcon = (log: EventChangeLogRecord) => {
  const contextObject =
    log.context && typeof log.context === 'object' && !Array.isArray(log.context)
      ? (log.context as JsonObject)
      : null
  const reason = contextObject?.reason as string | undefined

  if (reason === 'invoice_generated') return DocumentTextIcon
  if (reason === 'assign_driver' || reason === 'remove_driver') return UserIcon
  if (reason === 'assign_vehicle' || reason === 'remove_vehicle') return TruckIcon
  if (isMolideRegenerationLog(log)) return ArrowPathIcon

  const action = log.action?.toUpperCase()
  if (action === 'CREATED') return PlusCircleIcon
  if (action === 'DELETED') return TrashIcon
  if (action === 'STATUS_CHANGED') return ClockIcon
  return PencilSquareIcon
}

const getActionColor = (log: EventChangeLogRecord) => {
  const contextObject =
    log.context && typeof log.context === 'object' && !Array.isArray(log.context)
      ? (log.context as JsonObject)
      : null
  const reason = contextObject?.reason as string | undefined

  if (reason === 'invoice_generated')
    return {
      bg: 'bg-green-100 dark:bg-green-900/30',
      icon: 'text-green-600 dark:text-green-400',
      ring: 'ring-green-500/20',
    }
  if (reason === 'assign_driver' || reason === 'assign_vehicle')
    return {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      icon: 'text-blue-600 dark:text-blue-400',
      ring: 'ring-blue-500/20',
    }
  if (reason === 'remove_driver' || reason === 'remove_vehicle')
    return {
      bg: 'bg-red-100 dark:bg-red-900/30',
      icon: 'text-red-600 dark:text-red-400',
      ring: 'ring-red-500/20',
    }
  if (isMolideRegenerationLog(log))
    return {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      icon: 'text-purple-600 dark:text-purple-400',
      ring: 'ring-purple-500/20',
    }

  const action = log.action?.toUpperCase()
  if (action === 'CREATED')
    return {
      bg: 'bg-green-100 dark:bg-green-900/30',
      icon: 'text-green-600 dark:text-green-400',
      ring: 'ring-green-500/20',
    }
  if (action === 'DELETED')
    return {
      bg: 'bg-red-100 dark:bg-red-900/30',
      icon: 'text-red-600 dark:text-red-400',
      ring: 'ring-red-500/20',
    }
  if (action === 'STATUS_CHANGED')
    return {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      icon: 'text-yellow-600 dark:text-yellow-400',
      ring: 'ring-yellow-500/20',
    }

  return {
    bg: 'bg-gray-100 dark:bg-gray-800',
    icon: 'text-gray-600 dark:text-gray-400',
    ring: 'ring-gray-500/20',
  }
}

export function HistoryTab({ historyLogs }: HistoryTabProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-200 dark:border-gray-700 mb-6">
        Histórico de alterações
      </h2>

      {historyLogs.length > 0 ? (
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {historyLogs.map((log, logIndex) => {
              const actionLabel = formatLabel(log.action, ACTION_LABELS)
              const entityLabel = formatLabel(log.entity, ENTITY_LABELS)
              const actorDisplay = log.users?.full_name || log.changed_by_name || 'Sistema'
              const contextObject =
                log.context && typeof log.context === 'object' && !Array.isArray(log.context)
                  ? (log.context as JsonObject)
                  : null
              const reason = contextObject?.reason as string | undefined
              const summary = buildSummary(log, actorDisplay)
              const isSpecialLog =
                isMolideRegenerationLog(log) ||
                (reason
                  ? [
                      'assign_driver',
                      'remove_driver',
                      'assign_vehicle',
                      'remove_vehicle',
                      'invoice_generated',
                    ].includes(reason)
                  : false)

              const Icon = getActionIcon(log)
              const colors = getActionColor(log)
              const isLastItem = logIndex === historyLogs.length - 1

              return (
                <li key={`${log.id}-${log.field || 'all'}`}>
                  <div className="relative pb-8">
                    {!isLastItem ? (
                      <span
                        aria-hidden="true"
                        className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                      />
                    ) : null}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ring-8 ring-white dark:ring-gray-950 ${colors.bg}`}
                        >
                          <Icon aria-hidden="true" className={`h-5 w-5 ${colors.icon}`} />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition shadow-sm">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex flex-col gap-2 min-w-0 flex-1">
                              {summary && (
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {summary}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                                <ClockIcon className="h-3.5 w-3.5" />
                                <time dateTime={log.created_at}>
                                  {new Date(log.created_at).toLocaleString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </time>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1">
                                  <UserIcon className="h-3.5 w-3.5" />
                                  {actorDisplay}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              {entityLabel && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                  {entityLabel}
                                </span>
                              )}
                              {actionLabel && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                                  {actionLabel}
                                </span>
                              )}
                            </div>
                          </div>

                          {!isSpecialLog && log.field && (
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-500">
                              <span className="font-medium">Origem:</span> {log.source || 'app'}
                              {log.operation_id && (
                                <>
                                  <span className="mx-1">•</span>
                                  <span className="font-medium">Operação:</span> {log.operation_id}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Nenhuma alteração registrada ainda.
          </p>
        </div>
      )}
    </Card>
  )
}
