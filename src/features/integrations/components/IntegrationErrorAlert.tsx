'use client'

import { useSearchParams } from 'next/navigation'
import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const ERROR_MESSAGES: Record<string, string> = {
  auth_failed: 'Falha na autenticação com Conta Azul. Tente novamente.',
  config_missing:
    'Configuração do Conta Azul não encontrada. Verifique as variáveis de ambiente no Vercel: NEXT_PUBLIC_CONTA_AZUL_CLIENT_ID, CONTA_AZUL_CLIENT_SECRET, NEXT_PUBLIC_CONTA_AZUL_REDIRECT_URI',
  user_not_authenticated: 'Usuário não autenticado. Faça login e tente novamente.',
  token_exchange_failed:
    'Falha ao trocar código por token. Verifique as credenciais do Conta Azul.',
  store_failed: 'Falha ao salvar tokens no banco de dados.',
  invalid_params: 'Parâmetros de callback inválidos.',
  no_code: 'Código de autorização não recebido do Conta Azul.',
  access_denied: 'Acesso negado pelo usuário.',
}

const SUCCESS_MESSAGES: Record<string, string> = {
  contaazul_connected: 'Conta Azul conectada com sucesso!',
}

export function IntegrationErrorAlert() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const success = searchParams.get('success')

  if (!error && !success) return null

  if (success) {
    const message = SUCCESS_MESSAGES[success] || 'Operação realizada com sucesso!'

    return (
      <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">{message}</h3>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    const message = ERROR_MESSAGES[error] || `Erro desconhecido: ${error}`

    return (
      <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
              Erro na Integração
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
            {error === 'config_missing' && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                <strong>Variáveis necessárias no Vercel:</strong>
                <br />
                • NEXT_PUBLIC_CONTA_AZUL_CLIENT_ID
                <br />
                • CONTA_AZUL_CLIENT_SECRET
                <br />• NEXT_PUBLIC_CONTA_AZUL_REDIRECT_URI
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
