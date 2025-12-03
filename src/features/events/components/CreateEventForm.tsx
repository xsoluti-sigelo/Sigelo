'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { Button, Input, FormField } from '@/shared/ui'
import { createEventFormAction } from '../api/form-actions'
import { getAllContaAzulServices, getAllContaAzulCustomers } from '@/features/integrations/contaazul/api'
import type { ContaAzulServiceRecord, ContaAzulPessoaListItem } from '@/features/integrations/contaazul'
import { useServerActionWithRefresh } from '../hooks/useServerActionWithRefresh'
import { useCreateEventForm } from '../hooks/useCreateEventForm'
import { DocumentUploadZone } from '@/features/documents/components'
import { TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { formatPhone, formatCEP } from '@/shared/lib/masks'
import { toast } from 'sonner'
import { SectionCard } from './SectionCard'
import { createEventFormSchema } from '../schemas/create-event-form-schema'
import { EventType } from '@/features/events/config/event-types'
import { logger } from '@/shared/lib/logger'

type SectionKey = 'eventData' | 'location' | 'schedule' | 'services' | 'people' | 'documents'

interface OrderItem {
  id?: string
  description: string
  quantity: number
  days: number
  unit_price: number
  item_total: number
  service_id?: string
}

interface Order {
  id?: string
  number: string
  date: string
  total_value: number
  is_cancelled: boolean
  items: OrderItem[]
}

interface Person {
  id?: string
  name: string
  role: 'producer' | 'coordinator'
  phone: string | null
  is_primary?: boolean
}

interface EventService {
  id?: string
  contaazul_service_id: string
  quantity: number
  unit_price: number
  daily_rate: number
  total_price: number
  notes?: string
  order_id?: string
}

export interface CreateEventFormProps {
  initialData: {
    name: string
    number: string
    year: number
    date: string
    start_date?: string
    end_date?: string
    start_time: string
    end_time: string
    location: string
    contract: string | null
    client_id?: string
    services?: string[]
    eventServices?: EventService[]
    people?: Person[]
    orders?: Order[]
    received_date?: string | null
    is_night_event?: boolean | null
    is_intermittent?: boolean | null
    mobilization_datetime?: string | null
    demobilization_datetime?: string | null
    pre_cleaning_datetime?: string | null
    post_cleaning_datetime?: string | null
  }
}

export function CreateEventForm({ initialData }: CreateEventFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [servicos, setServicos] = useState<ContaAzulServiceRecord[]>([])
  const [clientes, setClientes] = useState<ContaAzulPessoaListItem[]>([])
  const [sectionVisibility, setSectionVisibility] = useState<Record<SectionKey, boolean>>({
    eventData: true,
    location: true,
    schedule: true,
    services: true,
    people: true,
    documents: true,
  })

  const { formState, setters, actions } = useCreateEventForm({ initialData })

  const { formAction } = useServerActionWithRefresh(createEventFormAction, {
    onSuccess: (data) => {
      if (data?.eventId) {
        actions.handleSaveSuccess(data.eventId)
      }
    },
    onError: (error) => {
      actions.handleSaveError(error)
    },
  })

  useEffect(() => {
    const loadServicos = async () => {
      try {
        const services = await getAllContaAzulServices()
        setServicos(services)
      } catch (error) {
        logger.error('Erro ao carregar serviços', error)
        toast.error('Erro ao carregar lista de serviços. Tente recarregar a página.')
        setServicos([])
      }
    }
    loadServicos()
  }, [])

  useEffect(() => {
    const loadClientes = async () => {
      try {
        const data = await getAllContaAzulCustomers()
        setClientes(data)
      } catch (error) {
        logger.error('Erro ao carregar clientes', error)
        toast.error('Erro ao carregar lista de clientes. Tente recarregar a página.')
        setClientes([])
      }
    }
    loadClientes()
  }, [])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationResult = createEventFormSchema.safeParse({
      name: formState.name,
      number: formState.number,
      clientId: formState.clientId,
      startDate: formState.startDate,
      endDate: formState.endDate,
      startTime: formState.startTime,
      endTime: formState.endTime,
      postalCode: formState.postalCode,
      locationNumber: formState.locationNumber,
      street: formState.street,
      complement: formState.complement,
      neighborhood: formState.neighborhood,
      city: formState.city,
      locationState: formState.locationState,
      rawAddress: formState.rawAddress,
      orders: formState.orders,
      people: formState.people,
    })

    if (!validationResult.success) {
      const message = validationResult.error.issues[0]?.message || 'Verifique os dados do evento'
      toast.error(message)
      return
    }

    try {
      const formData = new FormData()
      const eventData = await actions.getFormData()

      formData.append('data', JSON.stringify(eventData))

      startTransition(() => {
        formAction(formData)
      })
    } catch (error) {
      logger.error('Erro ao processar formulário', error)
      toast.error('Erro ao processar arquivos anexados. Verifique os arquivos e tente novamente.')
    }
  }

  const handleEventNumberChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '')
    setters.setNumber(numericValue)
  }

  const mobilizationDatetimeValue = formState.mobilizationDatetime
  const demobilizationDatetimeValue = formState.demobilizationDatetime

  const toggleSectionVisibility = (section: SectionKey) => {
    setSectionVisibility((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <SectionCard
          title="Dados do evento"
          description="Informações principais e complementares do evento"
          isCollapsed={!sectionVisibility.eventData}
          onToggle={() => toggleSectionVisibility('eventData')}
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome do evento *
                </label>
                <Input
                  value={formState.name}
                  onChange={(e) => setters.setName(e.target.value)}
                  required
                  placeholder="Ex: CORRIDA SÃO SILVESTRE"
                />
              </div>
              <div className="md:w-48">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Número *
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formState.number}
                  onChange={(e) => handleEventNumberChange(e.target.value)}
                  required
                  placeholder="Ex: 9314"
                />
              </div>
            </div>

            <FormField label="Cliente" required>
              <select
                value={formState.clientId}
                onChange={(e) => setters.setClientId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-gray-700 dark:bg-white dark:text-gray-900"
                required
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.name}
                    {cliente.cnpj ? ` - CNPJ: ${cliente.cnpj}` : ''}
                    {cliente.cpf ? ` - CPF: ${cliente.cpf}` : ''}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Contrato" optional helperText="Ex: 102/SPTURIS/2024">
                <Input
                  value={formState.contract}
                  onChange={(e) => setters.setContract(e.target.value)}
                  placeholder="Ex: 102/SPTURIS/2024"
                />
              </FormField>

              <FormField label="Data de recebimento" optional>
                <Input
                  type="date"
                  value={formState.receivedDate}
                  onChange={(e) => setters.setReceivedDate(e.target.value)}
                />
              </FormField>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Localização do evento"
          description="Endereço completo do local"
          isCollapsed={!sectionVisibility.location}
          onToggle={() => toggleSectionVisibility('location')}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              label="CEP"
              required
              helperText="Insira o CEP para buscar o endereço automaticamente"
            >
              <Input
                value={formState.postalCode}
                onChange={(e) => setters.setPostalCode(formatCEP(e.target.value))}
                required
                placeholder="Ex: 01310-100"
              />
            </FormField>

            <FormField label="Número" required>
              <Input
                value={formState.locationNumber}
                onChange={(e) => setters.setLocationNumber(e.target.value)}
                required
                placeholder="Ex: 1500"
              />
            </FormField>

            <FormField label="Rua/Avenida" className="md:col-span-2">
              <Input
                value={formState.street}
                onChange={(e) => setters.setStreet(e.target.value)}
                placeholder="Ex: Avenida Paulista"
                required
              />
            </FormField>

            <FormField label="Complemento">
              <Input
                value={formState.complement}
                onChange={(e) => setters.setComplement(e.target.value)}
                placeholder="Ex: Apto 101, Bloco A"
              />
            </FormField>

            <FormField label="Bairro">
              <Input
                value={formState.neighborhood}
                onChange={(e) => setters.setNeighborhood(e.target.value)}
                placeholder="Ex: Bela Vista"
                required
              />
            </FormField>

            <FormField label="Cidade">
              <Input
                value={formState.city}
                onChange={(e) => setters.setCity(e.target.value)}
                placeholder="Ex: São Paulo"
                required
              />
            </FormField>

            <FormField label="Estado">
              <Input
                value={formState.locationState}
                onChange={(e) => setters.setLocationState(e.target.value)}
                placeholder="Ex: SP"
                maxLength={2}
                required
              />
            </FormField>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Endereço completo
              </label>
              <Input
                value={formState.rawAddress}
                onChange={(e) => setters.setRawAddress(e.target.value)}
                placeholder="Ex: Avenida Paulista, 1500 - Bela Vista, São Paulo - SP"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Este endereço será usado para geocodificação
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <SectionCard
          title="Data do evento e recorrência"
          description="Defina o cronograma e tipo do evento"
          isCollapsed={!sectionVisibility.schedule}
          onToggle={() => toggleSectionVisibility('schedule')}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Data e horário de mobilização" required>
                <Input
                  type="datetime-local"
                  value={mobilizationDatetimeValue}
                  onChange={(e) => setters.setMobilizationDatetime(e.target.value)}
                  required
                />
              </FormField>
              <FormField label="Data e horário de desmobilização" required>
                <Input
                  type="datetime-local"
                  value={demobilizationDatetimeValue}
                  onChange={(e) => setters.setDemobilizationDatetime(e.target.value)}
                  required
                />
              </FormField>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Evento *
              </label>
              <select
                value={formState.eventType || ''}
                onChange={(e) =>
                  setters.setEventType(e.target.value as 'SINGLE_OCCURRENCE' | 'INTERMITENTE' | null)
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">Selecione o tipo de evento</option>
                <option value={EventType.UNIQUE}>ÚNICO - Contratos curtos com limpeza diária</option>
                <option value={EventType.INTERMITTENT}>
                  INTERMITENTE - Escolha os dias da semana para limpeza
                </option>
              </select>
            </div>

            {formState.eventType === EventType.UNIQUE && (
              <div className="border-t border-dashed border-gray-200 pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Para eventos ÚNICOS, a limpeza pós-uso ocorrerá todos os dias do evento no horário
                  especificado.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Horário da Limpeza Pós-Uso *
                  </label>
                  <Input
                    type="time"
                    value={formState.cleaningTime}
                    onChange={(e) => setters.setCleaningTime(e.target.value)}
                    className="w-40"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Exemplo: para evento das 9h às 18h, a limpeza pode ser às 19h
                  </p>
                </div>
              </div>
            )}

            {formState.eventType === EventType.INTERMITTENT && (
              <div className="border-t border-dashed border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dias da Semana para Limpeza *
                </label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-7">
                  {[
                    { value: 'DOM', label: 'Dom' },
                    { value: 'SEG', label: 'Seg' },
                    { value: 'TER', label: 'Ter' },
                    { value: 'QUA', label: 'Qua' },
                    { value: 'QUI', label: 'Qui' },
                    { value: 'SEX', label: 'Sex' },
                    { value: 'SAB', label: 'Sáb' },
                  ].map((day) => {
                    const availableDays = actions.getAvailableWeekdays()
                    const isAvailable = availableDays.includes(
                      day.value as 'DOM' | 'SEG' | 'TER' | 'QUA' | 'QUI' | 'SEX' | 'SAB',
                    )
                    const isSelected = formState.cleaningDaysOfWeek.includes(
                      day.value as 'DOM' | 'SEG' | 'TER' | 'QUA' | 'QUI' | 'SEX' | 'SAB',
                    )

                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() =>
                          isAvailable &&
                          actions.toggleCleaningDay(
                            day.value as 'DOM' | 'SEG' | 'TER' | 'QUA' | 'QUI' | 'SEX' | 'SAB',
                          )
                        }
                        disabled={!isAvailable}
                        className={`rounded-lg border-2 px-3 py-2 text-sm transition-colors ${
                          !isAvailable
                            ? 'border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
                            : isSelected
                              ? 'border-teal-500 bg-teal-50 text-teal-700 dark:border-teal-400 dark:bg-teal-900/30 dark:text-teal-200'
                              : 'border-gray-200 text-gray-600 hover:border-teal-300 dark:border-gray-700 dark:text-gray-300'
                        }`}
                        title={!isAvailable ? 'Este dia não existe no período selecionado' : ''}
                      >
                        {day.label}
                      </button>
                    )
                  })}
                </div>

                <FormField label="Horário da Limpeza" required className="mt-4">
                  <Input
                    type="time"
                    value={formState.cleaningTime}
                    onChange={(e) => setters.setCleaningTime(e.target.value)}
                    className="w-40"
                    required
                  />
                </FormField>
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Serviços"
          description="Detalhe os serviços que serão executados"
          actions={
            <Button type="button" size="sm" onClick={actions.addOrder}>
              + Adicionar serviço
            </Button>
          }
          isCollapsed={!sectionVisibility.services}
          onToggle={() => toggleSectionVisibility('services')}
        >
          <div className="space-y-6">
            {formState.orders.map((order, orderIndex) => (
              <div
                key={orderIndex}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Serviço #{orderIndex + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => actions.removeOrder(orderIndex)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Remover serviço"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {order.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 space-y-3"
                    >
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Serviço do conta azul
                        </label>
                        <select
                          value={item.service_id || ''}
                          onChange={(e) =>
                            actions.updateOrderItemWithService(
                              orderIndex,
                              itemIndex,
                              'service_id',
                              e.target.value,
                              servicos,
                            )
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="">Nenhum serviço selecionado</option>
                          {servicos.map((servico) => (
                            <option key={servico.id} value={servico.id}>
                              {servico.name} {servico.rate ? `- R$ ${servico.rate.toFixed(2)}` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Descrição
                        </label>
                        <Input
                          placeholder="Descrição"
                          value={item.description}
                          onChange={(e) =>
                            actions.updateOrderItem(
                              orderIndex,
                              itemIndex,
                              'description',
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Quantidade *
                          </label>
                          <Input
                            type="number"
                            placeholder="Qtd"
                            value={item.quantity}
                            onChange={(e) =>
                              actions.updateOrderItem(
                                orderIndex,
                                itemIndex,
                                'quantity',
                                Number(e.target.value),
                              )
                            }
                            min="1"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Dias *
                          </label>
                          <Input
                            type="number"
                            placeholder="Dias"
                            value={item.days}
                            readOnly
                            min="1"
                            required
                            className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                          />
                          <span className="mt-1 block text-[10px] font-normal text-gray-500 dark:text-gray-400">
                            Calculado automaticamente
                          </span>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Preço unitário *
                          </label>
                          <Input
                            type="number"
                            placeholder="Preço"
                            value={item.unit_price}
                            onChange={(e) =>
                              actions.updateOrderItem(
                                orderIndex,
                                itemIndex,
                                'unit_price',
                                Number(e.target.value),
                              )
                            }
                            step="0.01"
                            min="0"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {order.items.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-2 text-sm">
                      Nenhum item no serviço
                    </p>
                  )}

                  <div className="text-right border-t border-gray-200 pt-3 dark:border-gray-600">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total do serviço:{' '}
                      <span className="text-lg text-gray-900 dark:text-white">
                        R$ {order.total_value.toFixed(2)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {formState.orders.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                Nenhum serviço cadastrado. Adicione serviços.
              </p>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <SectionCard
          title="Pessoas envolvidas"
          description="Cadastre produtores e coordenadores do evento"
          actions={
            <Button type="button" size="sm" onClick={() => actions.addPerson('producer')}>
              + Adicionar pessoa
            </Button>
          }
          isCollapsed={!sectionVisibility.people}
          onToggle={() => toggleSectionVisibility('people')}
        >
          <div className="space-y-6">
            {formState.people.map((person, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/40"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Pessoa #{index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => actions.removePerson(index)}
                    className="p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                    title="Remover pessoa"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome *
                    </label>
                    <Input
                      placeholder="Nome completo"
                      value={person.name}
                      onChange={(e) => actions.updatePerson(index, 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Telefone
                    </label>
                    <Input
                      placeholder="(00) 00000-0000"
                      value={person.phone || ''}
                      onChange={(e) =>
                        actions.updatePerson(index, 'phone', formatPhone(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo *
                    </label>
                    <select
                      value={person.role}
                      onChange={(e) =>
                        actions.updatePerson(
                          index,
                          'role',
                          e.target.value as 'producer' | 'coordinator',
                        )
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    >
                      <option value="producer">Produtor</option>
                      <option value="coordinator">Coordenador</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {formState.people.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                Nenhuma pessoa cadastrada. Adicione contatos para o evento.
              </p>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Documentos anexados"
          optionalLabel="Opcional"
          description="Inclua contratos, notas fiscais e materiais de apoio"
          isCollapsed={!sectionVisibility.documents}
          onToggle={() => toggleSectionVisibility('documents')}
        >
          <DocumentUploadZone
            config={{
              maxFiles: 10,
              maxSizeInMB: 10,
              acceptedFormats: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg'],
              allowMultiple: true,
            }}
            helperText="Anexe contratos, notas fiscais ou outros documentos relevantes"
            onFilesChange={(files) => {
              const documents = files.map((file, index) => ({
                file,
                id: `${Date.now()}-${index}`,
              }))
              setters.setAttachedDocuments(documents)
            }}
          />
        </SectionCard>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  )
}
