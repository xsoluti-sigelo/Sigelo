'use client'

import { useState, useTransition } from 'react'
import type {
  OperationDetails as OperationDetailsType,
  DriverOption,
  VehicleOption,
  AssignmentResponse,
  OperationComment,
  Vehicle,
} from '@/features/operations/model/types'
import { AssignmentRole } from '@/shared/config/enums'
import { OperationStatus } from '@/features/operations/config/operations-config'
import {
  updateOperation,
  assignDriver,
  assignVehicle,
  removeDriverAssignment,
  removeVehicleAssignment,
  addOperationComment,
  removeOperationComment,
  togglePinComment,
} from '@/features/operations/api/mutations'
import { showSuccessToast, showErrorToast } from '@/shared/lib/toast'
import { LocationMap } from './LocationMap'
import { OperationHeader } from './OperationHeader'
import { OperationEquipment } from './OperationEquipment'
import { OperationAssignments } from './OperationAssignments'
import { OperationProducers } from './OperationProducers'
import { OperationComments } from './OperationComments'
import { useUser } from '@/entities/user'
import { usePermissions } from '@/features/auth/hooks/usePermissions'

interface AssignmentResult {
  assignmentId?: string
}

interface PartyData {
  id: string
  tenant_id: string
  display_name: string
  party_type: string
  active: boolean
  created_at: string
  updated_at: string
}

interface OperationDetailsProps {
  operation: OperationDetailsType
  drivers: DriverOption[]
  vehicles: VehicleOption[]
  currentAssignments: AssignmentResponse
  comments: OperationComment[]
}

export function OperationDetails({
  operation,
  drivers,
  vehicles,
  currentAssignments: initialAssignments,
  comments: initialComments,
}: OperationDetailsProps) {
  const { userId, isAdmin } = useUser()
  const { hasWritePermission } = usePermissions()
  const [isPending, startTransition] = useTransition()
  const [isSavingComment, startSavingComment] = useTransition()

  const [currentAssignments, setCurrentAssignments] =
    useState<AssignmentResponse>(initialAssignments)
  const [comments, setComments] = useState<OperationComment[]>(initialComments || [])

  const handleSaveOperation = (status: OperationStatus, date: string, time: string) => {
    startTransition(async () => {
      const result = await updateOperation({
        operationId: operation.id,
        data: { status, date, time },
      })

      if (result.success) {
        showSuccessToast('Operação atualizada com sucesso!')
      } else {
        showErrorToast(result.error || 'Erro ao atualizar operação')
      }
    })
  }

  const handleAssignDriver = (driverId: string) => {
    if (!driverId) {
      showErrorToast('Selecione um motorista')
      return
    }

    startTransition(async () => {
      const result = await assignDriver({
        operationId: operation.id,
        partyId: driverId,
      })
      if (result.success) {
        showSuccessToast('Motorista atribuído com sucesso!')
        const driver = drivers.find((d) => d.id === driverId)
        if (driver) {
          setCurrentAssignments((prev) => ({
            ...prev,
            serviceAssignments: [
              {
                id: (result as AssignmentResult).assignmentId || '',
                tenant_id: operation.tenant_id,
                molide_operation_id: operation.id,
                party_id: driverId,
                assignment_role: AssignmentRole.DRIVER,
                created_at: new Date().toISOString(),
                parties: driver as PartyData,
              },
            ],
          }))
        }
      } else {
        showErrorToast(result.error || 'Erro ao atribuir motorista')
      }
    })
  }

  const handleRemoveDriver = (assignmentId: string) => {
    startTransition(async () => {
      const result = await removeDriverAssignment({ assignmentId })
      if (result.success) {
        showSuccessToast('Motorista removido!')
        setCurrentAssignments((prev) => ({
          ...prev,
          serviceAssignments: [],
        }))
      } else {
        showErrorToast(result.error || 'Erro ao remover motorista')
      }
    })
  }

  const handleAssignVehicle = (vehicleId: string) => {
    if (!vehicleId) {
      showErrorToast('Selecione um veículo')
      return
    }

    startTransition(async () => {
      const result = await assignVehicle({
        operationId: operation.id,
        vehicleId,
      })
      if (result.success) {
        showSuccessToast('Veículo atribuído com sucesso!')
        const vehicle = vehicles.find((v) => v.id === vehicleId)
        if (vehicle) {
          setCurrentAssignments((prev) => ({
            ...prev,
            vehicleAssignment: {
              id: (result as AssignmentResult).assignmentId || '',
              tenant_id: operation.tenant_id,
              molide_operation_id: operation.id,
              vehicle_id: vehicleId,
              created_at: new Date().toISOString(),
              vehicles: vehicle as unknown as Vehicle,
            },
          }))
        }
      } else {
        showErrorToast(result.error || 'Erro ao atribuir veículo')
      }
    })
  }

  const handleRemoveVehicle = (assignmentId: string) => {
    startTransition(async () => {
      const result = await removeVehicleAssignment({ assignmentId })
      if (result.success) {
        showSuccessToast('Veículo removido!')
        setCurrentAssignments((prev) => ({
          ...prev,
          vehicleAssignment: null,
        }))
      } else {
        showErrorToast(result.error || 'Erro ao remover veículo')
      }
    })
  }

  const handleAddComment = (comment: string) => {
    const textContent = comment.replace(/<[^>]*>/g, '').trim()
    if (!textContent) {
      showErrorToast('Digite um comentário antes de salvar')
      return
    }

    startSavingComment(async () => {
      const result = await addOperationComment({
        operationId: operation.id,
        comment,
      })

      if (result.success) {
        setComments((prev) => [result.comment, ...prev])
        showSuccessToast('Comentário adicionado!')
      } else {
        showErrorToast(result.error || 'Erro ao salvar comentário')
      }
    })
  }

  const handleRemoveComment = async (commentId: string) => {
    const result = await removeOperationComment({
      commentId,
      operationId: operation.id,
    })

    if (result.success) {
      setComments((prev) => prev.filter((comment) => comment.id !== commentId))
      showSuccessToast('Comentário removido')
    } else {
      showErrorToast(result.error || 'Erro ao remover comentário')
    }
  }

  const handleTogglePin = async (commentId: string, isPinned: boolean) => {
    const result = await togglePinComment(commentId, operation.id, isPinned)

    if (result.success) {
      setComments((prev) => {
        const updated = prev.map((comment) => ({
          ...comment,
          is_pinned: comment.id === commentId ? isPinned : (isPinned ? false : comment.is_pinned),
        }))
        return updated.sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1
          if (!a.is_pinned && b.is_pinned) return 1
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
      })
      showSuccessToast(isPinned ? 'Comentário fixado!' : 'Comentário desafixado!')
    } else {
      showErrorToast(result.error || 'Erro ao fixar comentário')
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-[1600px] mx-auto">
        <OperationHeader operation={operation} isPending={isPending} onSave={handleSaveOperation} canEdit={hasWritePermission} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-8 px-8 py-8">
          <div className="h-[700px]">
            <LocationMap
              rawAddress={operation.events?.event_locations?.[0]?.raw_address}
              formattedAddress={operation.events?.event_locations?.[0]?.formatted_address}
              latitude={operation.events?.event_locations?.[0]?.latitude}
              longitude={operation.events?.event_locations?.[0]?.longitude}
              geocodingStatus={operation.events?.event_locations?.[0]?.geocoding_status}
            />
          </div>

          <div className="space-y-4">
            <OperationEquipment
              orderFulfillments={operation.events?.order_fulfillments}
              source={operation.events?.source}
            />

            <OperationAssignments
              drivers={drivers}
              vehicles={vehicles}
              currentAssignments={currentAssignments}
              isPending={isPending}
              onAssignDriver={handleAssignDriver}
              onRemoveDriver={handleRemoveDriver}
              onAssignVehicle={handleAssignVehicle}
              onRemoveVehicle={handleRemoveVehicle}
              canEdit={hasWritePermission}
            />

            {operation.events?.event_producers && (
              <OperationProducers producers={operation.events.event_producers} />
            )}
          </div>
        </div>

        <div className="px-8 pb-10">
          <OperationComments
            comments={comments}
            userId={userId}
            isAdmin={isAdmin}
            isSavingComment={isSavingComment}
            onAddComment={handleAddComment}
            onRemoveComment={handleRemoveComment}
            onTogglePin={handleTogglePin}
          />
        </div>
      </div>
    </div>
  )
}
