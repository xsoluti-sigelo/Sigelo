'use client'

import { Button, Input, Card } from '@/shared/ui'
import {
  useVehicleForm,
  createVehicleAction,
  FUEL_TYPES,
  SIZE_CATEGORIES,
} from '@/features/vehicle'
import { useState } from 'react'
import type { VehicleFormData } from '@/shared/lib/validations/vehicle'

interface VehicleFormWidgetProps {
  onSuccess?: () => void
}

export function VehicleFormWidget({ onSuccess }: VehicleFormWidgetProps) {
  const { form, formatLicensePlate, isPending } = useVehicleForm({ onSuccess })
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = form

  const licensePlate = watch('license_plate')

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()]
      setTags(newTags)
      setValue('tags', newTags)
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove)
    setTags(newTags)
    setValue('tags', newTags)
  }

  const onSubmit = async (data: VehicleFormData) => {
    const result = await createVehicleAction(data)
    if (result.success && onSuccess) {
      onSuccess()
    }
  }

  return (
    <Card className="p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Informações Principais
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                {...register('license_plate')}
                label="Placa"
                placeholder="ABC-1234"
                value={licensePlate}
                onChange={(e) => setValue('license_plate', formatLicensePlate(e.target.value))}
                maxLength={8}
                required
                error={errors.license_plate?.message}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Formato: ABC-1234 ou ABC1D23
              </p>
            </div>

            <Input
              {...register('model')}
              label="Modelo"
              placeholder="Ex: Sprinter, Kombi"
              required
              error={errors.model?.message}
            />

            <Input
              {...register('brand')}
              label="Marca"
              placeholder="Ex: Mercedes-Benz, Volkswagen"
              required
              error={errors.brand?.message}
            />

            <Input
              {...register('year', { valueAsNumber: true })}
              label="Ano"
              type="number"
              placeholder="Ex: 2020"
              required
              error={errors.year?.message}
            />

            <div>
              <Input
                {...register('module_capacity', { valueAsNumber: true })}
                label="Capacidade de Módulos"
                type="number"
                placeholder="Ex: 10"
                required
                error={errors.module_capacity?.message}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Número de módulos que o veículo pode transportar
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Informações Adicionais
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                {...register('cobli_number')}
                label="Número Cobli"
                placeholder="Ex: 12345"
                error={errors.cobli_number?.message}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Identificador no sistema Cobli
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Combustível
              </label>
              <select
                {...register('fuel_type')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {FUEL_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.fuel_type && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.fuel_type.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoria de Tamanho
              </label>
              <select
                {...register('size_category')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {SIZE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.size_category && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.size_category.message}
                </p>
              )}
            </div>

            <Input
              {...register('fuel_consumption_km_per_liter', {
                valueAsNumber: true,
              })}
              label="Consumo (km/l)"
              type="number"
              step="0.01"
              placeholder="Ex: 10.5"
              error={errors.fuel_consumption_km_per_liter?.message}
            />

            <Input
              {...register('speed_limit_kmh', { valueAsNumber: true })}
              label="Limite de Velocidade (km/h)"
              type="number"
              placeholder="Ex: 90"
              error={errors.speed_limit_kmh?.message}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Tags e Observações
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  placeholder="Digite uma tag e pressione Enter"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Adicionar
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 dark:bg-teal-900/20 text-teal-800 dark:text-teal-200 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-teal-900 dark:hover:text-teal-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                {...register('notes')}
                rows={4}
                placeholder="Informações adicionais sobre o veículo..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              {errors.notes && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.notes.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="submit" isLoading={isPending} disabled={isPending}>
            Criar Veículo
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isPending}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}
