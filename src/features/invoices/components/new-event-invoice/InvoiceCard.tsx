import type { NewEventInvoiceData } from '@/features/invoices/types'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

interface InvoiceCardProps {
  invoice: NewEventInvoiceData
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-lg">Fatura #{invoice.invoice_number || 'N/A'}</h4>
            {invoice.success && (
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                Sucesso
              </span>
            )}
          </div>
          {invoice.of_numbers && invoice.of_numbers.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">O.F.: {invoice.of_numbers.join(', ')}</p>
          )}
          {invoice.invoice_id_conta_azul && (
            <p className="text-xs text-gray-500 mt-1 font-mono">
              ID: {invoice.invoice_id_conta_azul}
            </p>
          )}
        </div>
      </div>

      {invoice.error_message && (
        <div className="mt-4 pt-4 border-t bg-red-50 p-3 rounded">
          <p className="text-xs text-red-600 font-medium">Erro</p>
          <p className="text-sm text-red-700 mt-1">{invoice.error_message}</p>
        </div>
      )}

      {invoice.invoice_id_conta_azul && (
        <div className="mt-4 pt-4 border-t">
          <a
            href={`https://app.contaazul.com/vendas/${invoice.invoice_id_conta_azul}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Ver no Conta Azul
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </a>
        </div>
      )}

      <div className="mt-4 pt-2 border-t text-xs text-gray-500">
        Criada em {new Date(invoice.created_at).toLocaleString('pt-BR')}
      </div>
    </div>
  )
}
