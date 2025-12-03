import { formatCurrency, formatDateTime } from '@/shared/lib/formatters'

type MarginTone = 'positive' | 'warning' | 'negative' | 'neutral'

interface MarginResult {
  value: number | null
  tone: MarginTone
  label: string
  colorClass: string
}

class ContaAzulServicesFormatterService {
  formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined || !Number.isFinite(value)) {
      return '-'
    }
    return formatCurrency(value)
  }

  calculateMargin(
    costRate: number | null | undefined,
    rate: number | null | undefined,
  ): MarginResult {
    if (
      costRate === null ||
      costRate === undefined ||
      rate === null ||
      rate === undefined ||
      !Number.isFinite(costRate) ||
      !Number.isFinite(rate) ||
      rate <= 0
    ) {
      return {
        value: null,
        tone: 'neutral',
        label: '-',
        colorClass: 'text-gray-400 dark:text-gray-500',
      }
    }

    const marginValue = ((rate - costRate) / rate) * 100

    if (!Number.isFinite(marginValue)) {
      return {
        value: null,
        tone: 'neutral',
        label: '-',
        colorClass: 'text-gray-400 dark:text-gray-500',
      }
    }

    let tone: MarginTone = 'negative'
    let colorClass = 'text-red-600 dark:text-red-400'

    if (marginValue >= 50) {
      tone = 'positive'
      colorClass = 'text-green-600 dark:text-green-400'
    } else if (marginValue >= 20) {
      tone = 'warning'
      colorClass = 'text-yellow-600 dark:text-yellow-400'
    }

    return {
      value: marginValue,
      tone,
      label: `${marginValue.toFixed(1)}%`,
      colorClass,
    }
  }

  formatSyncedAt(date: string | null | undefined): string {
    return formatDateTime(date)
  }
}

export const contaAzulServicesFormatterService = new ContaAzulServicesFormatterService()
