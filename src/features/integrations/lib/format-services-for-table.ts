import type { ContaAzulServiceRecord as ContaAzulService } from '@/features/integrations/contaazul'
import { contaAzulServicesFormatterService } from '../contaazul/services/contaazul-services-formatter.service'
import { getRelativeTime } from './date-utils'

export interface FormattedService {
  id: string
  name: string
  costRate: string
  rate: string
  margin: {
    label: string
    colorClass: string
  }
  syncedAt: string
}

export function formatServicesForTable(services: ContaAzulService[]): FormattedService[] {
  return services.map((service) => ({
    id: service.id,
    name: service.name,
    costRate: contaAzulServicesFormatterService.formatCurrency(service.cost_rate),
    rate: contaAzulServicesFormatterService.formatCurrency(service.rate),
    margin: contaAzulServicesFormatterService.calculateMargin(service.cost_rate, service.rate),
    syncedAt: getRelativeTime(service.synced_at),
  }))
}
