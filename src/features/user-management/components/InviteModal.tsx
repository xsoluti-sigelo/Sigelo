'use client'

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { Input, Select } from '@/shared/ui'
import { cn } from '@/shared'
import { showSuccessToast, showErrorToast, showValidationErrorToast } from '@/shared/lib/toast'
import { createInvite } from '../actions'

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function InviteModal({ isOpen, onClose, onSuccess }: InviteModalProps) {
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
          showSuccessToast('Convite criado! Copie e compartilhe o link.')
          setFormData({ email: '', full_name: '', role: 'OPERATOR' })
          onClose()
          onSuccess?.()
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Novo Convite</h2>
            <button
              onClick={handleClose}
              disabled={isPending}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <Input
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

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome Completo *
                </label>
                <Input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="João da Silva"
                  error={errors.full_name}
                  disabled={isPending}
                />
              </div>

              {/* Role */}
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

              {/* Info Box */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Como funciona o convite por link?
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Um link único será gerado (sem envio de e-mail)</li>
                  <li>• O link terá validade de 7 dias</li>
                  <li>• Compartilhe o link manualmente (WhatsApp, etc.)</li>
                  <li>• O usuário deve entrar com Google usando este e-mail</li>
                  <li>• Após o login, será vinculado ao tenant e papel</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className={cn(
                  'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
                  isPending ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700',
                )}
              >
                {isPending ? 'Gerando...' : 'Gerar Convite'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
