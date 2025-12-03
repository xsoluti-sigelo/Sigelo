import {
  getOperationById,
  getDrivers,
  getVehicles,
  getOperationAssignments,
  getOperationTypeLabel,
  getOperationComments,
} from '@/features/operations'
import { OperationDetailsNew } from '@/features/operations'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const operation = await getOperationById(id)

  if (!operation) {
    return {
      title: 'Operação não encontrada - Sigelo',
      description: 'A operação solicitada não foi encontrada',
    }
  }

  const operationTypeLabel = getOperationTypeLabel(operation.type)

  return {
    title: `Operação ${operationTypeLabel} - Sigelo`,
    description: `Detalhes da operação de ${operationTypeLabel.toLowerCase()}`,
  }
}

export default async function OperationPage({ params }: PageProps) {
  const { id } = await params

  const [operation, drivers, vehicles, assignments, comments] = await Promise.all([
    getOperationById(id),
    getDrivers(),
    getVehicles(),
    getOperationAssignments(id),
    getOperationComments(id),
  ])

  if (!operation) {
    notFound()
  }

  return (
    <OperationDetailsNew
      operation={operation as never}
      drivers={drivers as never}
      vehicles={vehicles as never}
      currentAssignments={assignments as never}
      comments={comments as never}
    />
  )
}
