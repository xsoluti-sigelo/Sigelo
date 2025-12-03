import { OperationStatusLabels as StatusLabels } from './operation-status'

export enum OperationType {
  MOBILIZATION = 'MOBILIZATION',
  CLEANING = 'CLEANING',
  DEMOBILIZATION = 'DEMOBILIZATION',
  SUCTION = 'SUCTION',
}

export const OperationTypeLabels: Record<OperationType, string> = {
  [OperationType.MOBILIZATION]: 'Mobilização',
  [OperationType.CLEANING]: 'Limpeza',
  [OperationType.DEMOBILIZATION]: 'Desmobilização',
  [OperationType.SUCTION]: 'Sucção',
}

export const OperationTypeShort: Record<OperationType, string> = {
  [OperationType.MOBILIZATION]: 'MO',
  [OperationType.CLEANING]: 'LI',
  [OperationType.DEMOBILIZATION]: 'DE',
  [OperationType.SUCTION]: 'SU',
}

export const OperationTypeColors: Record<OperationType, string> = {
  [OperationType.MOBILIZATION]:
    'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  [OperationType.CLEANING]:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  [OperationType.DEMOBILIZATION]:
    'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  [OperationType.SUCTION]:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
}

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'purple' | 'teal'

export const OperationTypeVariants: Record<OperationType, BadgeVariant> = {
  [OperationType.MOBILIZATION]: 'purple',
  [OperationType.CLEANING]: 'teal',
  [OperationType.DEMOBILIZATION]: 'info',
  [OperationType.SUCTION]: 'info',
}

export function getOperationTypeLabel(type: string): string {
  return OperationTypeLabels[type as keyof typeof OperationTypeLabels] || type
}

export function getOperationTypeVariant(type: string): BadgeVariant {
  return OperationTypeVariants[type as keyof typeof OperationTypeVariants] || 'neutral'
}

export { OperationStatus, OperationStatusLabels, OperationStatusColors } from './operation-status'
export type { OperationStatusValue, OperationStatusEnum } from './operation-status'

export function getOperationStatusLabel(status: string): string {
  return StatusLabels[status as keyof typeof StatusLabels] || status
}
