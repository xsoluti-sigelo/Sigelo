'use client'

import { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { DocumentTextIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { generateNewEventInvoice } from '@/entities/new-event-invoice/actions/generate-invoice'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface GenerateOrderInvoiceButtonProps {
  eventId: string
  orderId: string
  orderNumber: string
  disabled?: boolean
  hasInvoice?: boolean
}

export function GenerateOrderInvoiceButton({
  eventId,
  orderId,
  orderNumber,
  disabled,
  hasInvoice,
}: GenerateOrderInvoiceButtonProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      const result = await generateNewEventInvoice({
        eventId,
        strategy: 'INDIVIDUAL',
        orderIds: [orderId],
      })

      if (result.success) {
        toast.success(`Fatura gerada para O.F. ${orderNumber}`, {
          description: `NF #${result.invoices?.[0]?.invoiceNumber || 'N/A'}`,
        })
        router.refresh()
      } else {
        toast.error('Erro ao gerar fatura', {
          description: result.error || 'Erro desconhecido',
        })
      }
    } catch (error) {
      toast.error('Erro ao gerar fatura', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (hasInvoice) {
    return (
      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
        <CheckCircleIcon className="w-4 h-4" />
        <span>Fatura gerada</span>
      </div>
    )
  }

  return (
    <Button
      onClick={handleGenerate}
      disabled={disabled || isGenerating}
      size="sm"
      variant="outline"
      className="gap-1.5"
      title={
        disabled
          ? 'Todas as operações MOLIDE devem estar concluídas'
          : 'Gerar fatura individual para esta O.F.'
      }
    >
      {isGenerating ? (
        <>
          <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
          <span className="text-xs">Gerando...</span>
        </>
      ) : (
        <>
          <DocumentTextIcon className="w-3.5 h-3.5" />
          <span className="text-xs">Gerar fatura</span>
        </>
      )}
    </Button>
  )
}
