'use client'

import { useState, useCallback } from 'react'
import { Button, Input } from '@/shared/ui'
import { updateEventLocation } from '../actions'
import { showSuccessToast, showErrorToast } from '@/shared/lib/toast'

interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

interface LocationEditorProps {
  issueId: string
  eventId: string
  currentValue?: string
  onSaved: () => void
  onCancel: () => void
}

export function LocationEditor({
  issueId,
  eventId,
  currentValue = '',
  onSaved,
  onCancel,
}: LocationEditorProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const [formData, setFormData] = useState({
    postalCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    rawAddress: currentValue,
  })

  const fetchAddressFromCep = useCallback(async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return

    setIsLoadingCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data: ViaCepResponse = await response.json()

      if (data.erro) {
        showErrorToast('CEP não encontrado')
        return
      }

      setFormData((prev) => ({
        ...prev,
        street: data.logradouro || prev.street,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
        complement: data.complemento || prev.complement,
      }))

      showSuccessToast('Endereço carregado com sucesso')
    } catch {
      showErrorToast('Erro ao buscar CEP')
    } finally {
      setIsLoadingCep(false)
    }
  }, [])

  const handleCepChange = (value: string) => {
    setFormData({ ...formData, postalCode: value })

    const cleanCep = value.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      fetchAddressFromCep(cleanCep)
    }
  }

  const handleSave = async () => {
    if (!formData.postalCode || !formData.street || !formData.city || !formData.state) {
      showErrorToast('Preencha os campos obrigatórios: CEP, Rua, Cidade e Estado')
      return
    }

    setIsUpdating(true)
    try {
      const addressParts = [
        formData.street,
        formData.number || 'S/N',
        formData.complement,
        formData.neighborhood,
        formData.city,
        formData.state,
        formData.postalCode,
      ].filter(Boolean)

      const newAddress = addressParts.join(', ')

      const result = await updateEventLocation({
        issueId,
        eventId,
        locationData: {
          raw_address: newAddress,
          street: formData.street,
          number: formData.number || null,
          complement: formData.complement || null,
          neighborhood: formData.neighborhood || null,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode,
        },
        autoResolve: true,
      })

      if (result.success) {
        showSuccessToast(result.message || 'Endereço atualizado com sucesso')
        onSaved()
      } else {
        showErrorToast(result.error || 'Erro ao atualizar endereço')
      }
    } catch {
      showErrorToast('Erro inesperado ao atualizar endereço')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-4 mt-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Editar localização
      </h5>

      {currentValue && (
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Endereço atual (referência)
          </label>
          <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 font-mono">
            {currentValue}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            CEP *
          </label>
          <div className="relative">
            <Input
              value={formData.postalCode}
              onChange={(e) => handleCepChange(e.target.value)}
              placeholder="00000-000"
              maxLength={9}
              disabled={isLoadingCep}
            />
            {isLoadingCep && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Digite o CEP para buscar o endereço
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Número
          </label>
          <Input
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            placeholder="Ex: 1500 ou S/N"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rua *
          </label>
          <Input
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            placeholder="Ex: Avenida Paulista"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Complemento
          </label>
          <Input
            value={formData.complement}
            onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
            placeholder="Ex: Próximo ao metrô"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bairro
          </label>
          <Input
            value={formData.neighborhood}
            onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
            placeholder="Ex: Bela Vista"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cidade *
          </label>
          <Input
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="Ex: São Paulo"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estado *
          </label>
          <Input
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
            placeholder="SP"
            maxLength={2}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button size="sm" onClick={handleSave} isLoading={isUpdating}>
          Salvar endereço
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} disabled={isUpdating}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
