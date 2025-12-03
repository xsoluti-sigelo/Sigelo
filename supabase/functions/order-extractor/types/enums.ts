export const MolideOperationType = {
  MOBILIZATION: 'MOBILIZATION',
  CLEANING: 'CLEANING',
  DEMOBILIZATION: 'DEMOBILIZATION',
  SUCTION: 'SUCTION',
} as const

export const MolideStatus = {
  SCHEDULED: 'SCHEDULED',
  RECEIVED: 'RECEIVED',
  VERIFIED: 'VERIFIED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  INCOMPLETE: 'INCOMPLETE',
  TIME_ERROR: 'TIME_ERROR',
} as const

export type MolideOperationTypeValue =
  (typeof MolideOperationType)[keyof typeof MolideOperationType]
export type MolideStatusValue = (typeof MolideStatus)[keyof typeof MolideStatus]
