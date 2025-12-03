'use client'

import { useState, useEffect, useTransition } from 'react'
import { Button } from '@/shared/ui'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { createStandaloneOperation } from '@/features/operations/api/mutations'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createStandaloneOperationSchema } from '@/features/operations/model/standalone-operation-schema'
import type { ContaAzulServiceRecord as ContaAzulService } from '@/features/integrations/contaazul'
import type {
  DriverOption,
  VehicleOption,
  CreateStandaloneOperationInput,
} from '@/features/operations/model/types'
import { OperationType } from '@/features/operations/config/operations-config'
import { useOrderManagement } from '@/features/operations/hooks/useOrderManagement'
import { EventInfoFields } from './create-operation/EventInfoFields'
import { AddressForm } from './create-operation/AddressForm'
import { OperationFields } from './create-operation/OperationFields'
import { OrdersList } from './create-operation/OrdersList'
import { AssignmentsFields } from './create-operation/AssignmentsFields'
import { lookupCEP } from '../api/actions/lookup-cep'
import { logger } from '@/shared/lib/logger'

interface CreateStandaloneOperationModalProps {
  isOpen: boolean
  onClose: () => void
  drivers: DriverOption[]
  vehicles: VehicleOption[]
  services: ContaAzulService[]
}

type OperationFormState = Omit<CreateStandaloneOperationInput, 'orders'>

const createInitialFormState = (): OperationFormState => ({
  event: {
    eventNumber: '',
    eventDescription: '',
    date: new Date().toISOString().split('T')[0],
    address: {
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
    },
  },
  operation: {
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    type: OperationType.MOBILIZATION,
  },
  assignments: {
    vehicleId: '',
    partyId: '',
  },
})

export function CreateStandaloneOperationModal({
  isOpen,
  onClose,
  drivers,
  vehicles,
  services,
}: CreateStandaloneOperationModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCepLoading, startCepTransition] = useTransition()

  const [formData, setFormData] = useState<OperationFormState>(createInitialFormState)

  const orderManagement = useOrderManagement({ services })

  const resetForm = () => {
    setFormData(createInitialFormState())
    orderManagement.resetOrders()
  }

  useEffect(() => {
    if (isOpen) {
      resetForm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const ordersPayload = orderManagement.getOrdersPayload()
      const payload: CreateStandaloneOperationInput = {
        ...formData,
        orders: ordersPayload.length > 0 ? ordersPayload : undefined,
      }

      const validation = createStandaloneOperationSchema.safeParse(payload)
      if (!validation.success) {
        const firstError =
          Object.values(validation.error.flatten().fieldErrors).flat()[0] || 'Dados inválidos'
        toast.error(firstError)
        setIsSubmitting(false)
        return
      }

      const result = await createStandaloneOperation({
        ...validation.data,
      })

      if (result.success) {
        toast.success('Operação individual criada com sucesso!')
        onClose()
        if (result.operationId) {
          router.push(`/operacoes/${result.operationId}`)
        } else {
          router.refresh()
        }
      } else {
        toast.error(result.error || 'Erro ao criar operação')
      }
    } catch (error) {
      logger.error('Error creating standalone operation', error)
      toast.error('Erro inesperado ao criar operação')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCepBlur = (cep: string) => {
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      return
    }

    startCepTransition(async () => {
      const result = await lookupCEP(cep)

      if (result.success && result.data) {
        const { cep, street, neighborhood, city, state } = result.data
        setFormData((prev) => ({
          ...prev,
          event: {
            ...prev.event,
            address: {
              ...prev.event.address,
              cep,
              street,
              neighborhood,
              city,
              state,
            },
          },
        }))
        toast.success('Endereço encontrado!')
      } else {
        toast.error(result.error || 'Erro ao buscar CEP')
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Nova operação individual
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            disabled={isSubmitting}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-8 max-h-[calc(100vh-120px)] overflow-y-auto"
        >
          <EventInfoFields
            eventNumber={formData.event.eventNumber || ''}
            eventDescription={formData.event.eventDescription}
            onEventNumberChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                event: { ...prev.event, eventNumber: value },
              }))
            }
            onEventDescriptionChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                event: { ...prev.event, eventDescription: value },
              }))
            }
          />

          <AddressForm
            address={{
              ...formData.event.address,
              complement: formData.event.address.complement || '',
            }}
            onAddressChange={(field, value) =>
              setFormData((prev) => ({
                ...prev,
                event: {
                  ...prev.event,
                  address: { ...prev.event.address, [field]: value },
                },
              }))
            }
            onCepBlur={handleCepBlur}
            isCepLoading={isCepLoading}
          />

          <OperationFields
            date={formData.operation.date}
            time={formData.operation.time}
            type={formData.operation.type}
            onDateChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                operation: { ...prev.operation, date: value },
              }))
            }
            onTimeChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                operation: { ...prev.operation, time: value },
              }))
            }
            onTypeChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                operation: { ...prev.operation, type: value },
              }))
            }
          />

          <OrdersList
            orders={orderManagement.orders}
            services={services}
            onAddOrder={orderManagement.addOrder}
            onRemoveOrder={orderManagement.removeOrder}
            onUpdateOrder={orderManagement.updateOrder}
            onAddOrderItem={orderManagement.addOrderItem}
            onRemoveOrderItem={orderManagement.removeOrderItem}
            onUpdateOrderItem={orderManagement.updateOrderItem}
            onUpdateOrderItemWithService={orderManagement.updateOrderItemWithService}
          />

          <AssignmentsFields
            vehicleId={formData.assignments?.vehicleId || ''}
            partyId={formData.assignments?.partyId || ''}
            drivers={drivers}
            vehicles={vehicles}
            onVehicleChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                assignments: { ...prev.assignments!, vehicleId: value },
              }))
            }
            onDriverChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                assignments: { ...prev.assignments!, partyId: value },
              }))
            }
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900 pb-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar operação'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
