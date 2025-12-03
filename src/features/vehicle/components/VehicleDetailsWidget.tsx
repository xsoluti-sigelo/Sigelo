'use client'

import Link from 'next/link'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { showSuccessToast, showErrorToast } from '@/shared/lib/toast'
import { deleteVehicleAction, FUEL_TYPE_LABELS, SIZE_CATEGORY_LABELS } from '@/features/vehicle'
import { ROUTES } from '@/shared/config'

interface VehicleDetailsWidgetProps {
  vehicle: {
    id: string
    license_plate: string
    brand: string
    model: string
    year: number
    module_capacity: number
    active: boolean
    cobli_number: string | null
    fuel_type: string | null
    size_category: string | null
    fuel_consumption_km_per_liter: number | null
    speed_limit_kmh: number | null
    tags: string[] | null
    notes: string | null
    created_at: string
    updated_at: string | null
  }
  canEdit?: boolean
  canDelete?: boolean
}

export function VehicleDetailsWidget({
  vehicle,
  canEdit = true,
  canDelete = false,
}: VehicleDetailsWidgetProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const vehicleName = `${vehicle.brand} ${vehicle.model} - ${vehicle.license_plate}`

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteVehicleAction(vehicle.id)

      if (result.success) {
        showSuccessToast('Veículo excluído com sucesso!')
        router.push(ROUTES.VEHICLES)
        router.refresh()
      } else {
        showErrorToast(result.error || 'Erro ao excluir veículo')
      }
      setShowDeleteConfirm(false)
    })
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{vehicleName}</h2>
            <p className="text-gray-600 dark:text-gray-400">Ano: {vehicle.year}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                vehicle.active
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
              }`}
            >
              {vehicle.active ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
              Informações básicas
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Placa</dt>
                <dd className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                  {vehicle.license_plate}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Marca</dt>
                <dd className="text-sm text-gray-900 dark:text-gray-100">{vehicle.brand}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Modelo</dt>
                <dd className="text-sm text-gray-900 dark:text-gray-100">{vehicle.model}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Ano</dt>
                <dd className="text-sm text-gray-900 dark:text-gray-100">{vehicle.year}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Capacidade de módulos
                </dt>
                <dd className="text-sm text-gray-900 dark:text-gray-100">
                  {vehicle.module_capacity} módulos
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
              Informações técnicas
            </h3>
            <dl className="space-y-3">
              {vehicle.cobli_number && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Número cobli
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    {vehicle.cobli_number}
                  </dd>
                </div>
              )}
              {vehicle.fuel_type && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Tipo de combustível
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    {FUEL_TYPE_LABELS[vehicle.fuel_type] || vehicle.fuel_type}
                  </dd>
                </div>
              )}
              {vehicle.fuel_consumption_km_per_liter && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Consumo médio
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    {vehicle.fuel_consumption_km_per_liter.toFixed(1)} km/l
                  </dd>
                </div>
              )}
              {vehicle.size_category && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Categoria de tamanho
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    {SIZE_CATEGORY_LABELS[vehicle.size_category] || vehicle.size_category}
                  </dd>
                </div>
              )}
              {vehicle.speed_limit_kmh && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Limite de velocidade
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    {vehicle.speed_limit_kmh} km/h
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {vehicle.tags && vehicle.tags.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {vehicle.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {vehicle.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              Observações
            </h3>
            <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {vehicle.notes}
            </p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Informações do sistema
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Criado em</dt>
              <dd className="text-sm text-gray-900 dark:text-gray-100">
                {new Date(vehicle.created_at).toLocaleString('pt-BR')}
              </dd>
            </div>
            {vehicle.updated_at && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Atualizado em
                </dt>
                <dd className="text-sm text-gray-900 dark:text-gray-100">
                  {new Date(vehicle.updated_at).toLocaleString('pt-BR')}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link href="/veiculos">
            <Button variant="outline">Voltar</Button>
          </Link>
          {canEdit && (
            <Link href={`/veiculos/${vehicle.id}/editar`}>
              <Button variant="primary">Editar</Button>
            </Link>
          )}
          {canDelete && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="ml-auto text-red-600 hover:text-red-700"
              >
                Excluir
              </Button>

              {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <Card className="p-6 max-w-md mx-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                      Confirmar exclusão
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                      Tem certeza que deseja excluir o veículo {vehicleName}? Esta ação não pode ser
                      desfeita.
                    </p>
                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isPending}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleDelete}
                        isLoading={isPending}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Excluir
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
