'use client'

import { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { generateNewEventInvoice } from '@/entities/new-event-invoice/actions/generate-invoice'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface GenerateInvoiceButtonProps {
  eventId: string
  eventSource: string | null
  disabled?: boolean
  orderIds?: string[]
}

export function GenerateInvoiceButton({
  eventId,
  eventSource,
  disabled,
  orderIds,
}: GenerateInvoiceButtonProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)

  const strategy = eventSource === 'MANUAL' ? 'CONSOLIDATED' : 'INDIVIDUAL'

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      const result = await generateNewEventInvoice({
        eventId,
        strategy,
        orderIds,
      })

      if (result.success) {
        const invoicesCount = result.invoices?.length || 0
        toast.success(`${invoicesCount} fatura(s) gerada(s) com sucesso!`, {
          description:
            strategy === 'CONSOLIDATED'
              ? 'Fatura consolidada criada'
              : `${invoicesCount} fatura(s) individual(is) criada(s)`,
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

  return (
    <Button onClick={handleGenerate} disabled={disabled || isGenerating} className="gap-2">
      {isGenerating ? (
        <>
          <ArrowPathIcon className="w-4 h-4 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <DocumentTextIcon className="w-4 h-4" />
          Gerar fatura {strategy === 'CONSOLIDATED' ? 'Consolidada' : 'Individual'}
        </>
      )}
    </Button>
  )
}
