export interface DelegationStatus {
  hasOperations: boolean
  totalOperations: number
  executedOperations: number
  pendingOperations: number
  canDelegate: boolean
  delegationMode: 'initial' | 'regenerate' | 'update' | 'completed' | 'blocked'
  buttonText: string
  buttonIcon: 'plus' | 'refresh' | 'pencil' | 'check'
  buttonVariant: 'primary' | 'secondary' | 'outline'
  showPreview: boolean
  warningMessage?: string
  hasBlockingOperations?: boolean
}
