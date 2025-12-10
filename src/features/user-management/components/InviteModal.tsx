'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/shared/ui/Modal'
import { Button, Input, Select } from '@/shared/ui'
import { showErrorToast, showValidationErrorToast } from '@/shared/lib/toast'
import { createInvite } from '../actions'

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function InviteModal({ isOpen, onClose, onSuccess }: InviteModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'OPERATOR' as 'ADMIN' | 'OPERATOR' | 'VIEWER',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.full_name) {
      newErrors.full_name = 'Nome completo é obrigatório'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      showValidationErrorToast()
      return
    }

    startTransition(async () => {
      try {
        const response = await createInvite(formData)

        if (response.success) {
          setFormData({ email: '', full_name: '', role: 'OPERATOR' })
          onClose()
          onSuccess?.()
          router.push('/usuarios/convite-enviado')
        } else {
          showErrorToast(response.error || 'Erro ao criar convite')
        }
      } catch {
        showErrorToast('Erro ao criar convite')
      }
    })
  }

  const handleClose = () => {
    if (!isPending) {
      setFormData({ email: '', full_name: '', role: 'OPERATOR' })
      setErrors({})
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Novo Convite" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="usuario@empresa.com"
            error={errors.email}
            autoFocus
            disabled={isPending}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Geraremos um link de convite para este e-mail
          </p>
        </div>

        <div>
          <Input
            label="Nome Completo *"
            type="text"
            value={formData.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            placeholder="João da Silva"
            error={errors.full_name}
            disabled={isPending}
          />
        </div>

        <div>
          <Select
            label="Papel no Sistema *"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            disabled={isPending}
            options={[
              {
                value: 'VIEWER',
                label: 'Visualizador - Apenas visualizar dados',
              },
              {
                value: 'OPERATOR',
                label: 'Operador - Criar e editar operações',
              },
              { value: 'ADMIN', label: 'Administrador - Acesso completo' },
            ]}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Define as permissões que o usuário terá no sistema
          </p>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Um e-mail será enviado com o link de convite. O convite expira em 7 dias.
        </p>

        <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isPending} disabled={isPending}>
            Gerar Convite
          </Button>
        </div>
      </form>
    </Modal>
  )
}
