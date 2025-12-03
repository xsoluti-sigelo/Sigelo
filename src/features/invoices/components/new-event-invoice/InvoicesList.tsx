import type { NewEventInvoiceData } from '@/features/invoices/types'
import { InvoiceCard } from './InvoiceCard'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'

interface InvoicesListProps {
  invoices: NewEventInvoiceData[]
}

export function InvoicesList({ invoices }: InvoicesListProps) {
  if (invoices.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center bg-gray-50">
        <ExclamationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">Nenhuma fatura gerada</p>
        <p className="text-sm text-gray-500 mt-1">
          Clique no botão acima para gerar a fatura deste evento
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Faturas ({invoices.length})</h3>
      </div>

      <div className="grid gap-4">
        {invoices.map((invoice) => (
          <InvoiceCard key={invoice.id} invoice={invoice} />
        ))}
      </div>
    </div>
  )
}
