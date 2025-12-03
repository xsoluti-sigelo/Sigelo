'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { vehicleSchema, type VehicleFormData } from '@/shared/lib/validations/vehicle'
import { createVehicleAction, updateVehicleAction } from '../actions'
import type { Vehicle, FuelType, SizeCategory } from '../types'

interface UseVehicleFormProps {
  onSuccess?: () => void
  initialData?: Vehicle | null
  vehicleId?: string
}

export function useVehicleForm({ onSuccess, initialData, vehicleId }: UseVehicleFormProps = {}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [globalError, setGlobalError] = useState<string | null>(null)
  const isEditMode = Boolean(vehicleId && initialData)

  const formatLicensePlate = useCallback((value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '')

    if (cleaned.length <= 3) {
      return cleaned
    } else if (cleaned.length <= 7) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    }

    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}`
  }, [])

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      license_plate: '',
      model: '',
      brand: '',
      year: new Date().getFullYear(),
      module_capacity: 1,
      cobli_number: '',
      fuel_type: undefined,
      size_category: undefined,
      fuel_consumption_km_per_liter: undefined,
      speed_limit_kmh: undefined,
      tags: [],
      notes: '',
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        license_plate: formatLicensePlate(initialData.license_plate),
        model: initialData.model,
        brand: initialData.brand,
        year: initialData.year,
        module_capacity: initialData.module_capacity,
        cobli_number: initialData.cobli_number || '',
        fuel_type: (initialData.fuel_type as FuelType) || undefined,
        size_category: (initialData.size_category as SizeCategory) || undefined,
        fuel_consumption_km_per_liter: initialData.fuel_consumption_km_per_liter || undefined,
        speed_limit_kmh: initialData.speed_limit_kmh || undefined,
        tags: initialData.tags || [],
        notes: initialData.notes || '',
      })
    } else {
      form.reset({
        license_plate: '',
        model: '',
        brand: '',
        year: new Date().getFullYear(),
        module_capacity: 1,
        cobli_number: '',
        fuel_type: undefined,
        size_category: undefined,
        fuel_consumption_km_per_liter: undefined,
        speed_limit_kmh: undefined,
        tags: [],
        notes: '',
      })
    }
  }, [initialData, form, formatLicensePlate])

  const onSubmit = async (data: VehicleFormData) => {
    setGlobalError(null)

    startTransition(async () => {
      try {
        const result = isEditMode
          ? await updateVehicleAction({ vehicleId: vehicleId!, data })
          : await createVehicleAction(data)

        if (result.success) {
          toast.success(
            isEditMode ? 'Veículo atualizado com sucesso!' : 'Veículo cadastrado com sucesso!',
          )
          if (!isEditMode) {
            form.reset()
          }
          router.refresh()
          if (onSuccess) onSuccess()
        } else {
          const errorMessage =
            result.error || (isEditMode ? 'Erro ao atualizar veículo' : 'Erro ao criar veículo')
          setGlobalError(errorMessage)
          toast.error(errorMessage)
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : isEditMode
              ? 'Erro ao atualizar veículo'
              : 'Erro ao criar veículo'
        setGlobalError(errorMessage)
        toast.error(errorMessage)
      }
    })
  }

  return {
    form,
    formatLicensePlate,
    onSubmit,
    isPending,
    globalError,
  }
}
