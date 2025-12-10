'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { showSuccessToast, showErrorToast } from '@/shared/lib/toast'

const ERROR_MESSAGES: Record<string, string> = {
  auth_failed: 'Falha na autenticação com Conta Azul. Tente novamente.',
  config_missing:
    'Configuração do Conta Azul não encontrada. Verifique as variáveis de ambiente.',
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
  const router = useRouter()
  const hasShownToast = useRef(false)

  const error = searchParams.get('error')
  const success = searchParams.get('success')

  useEffect(() => {
    if (hasShownToast.current) return

    if (success) {
      const message = SUCCESS_MESSAGES[success] || 'Operação realizada com sucesso!'
      showSuccessToast(message)
      hasShownToast.current = true
      router.replace('/integracoes/conexao', { scroll: false })
    } else if (error) {
      const message = ERROR_MESSAGES[error] || `Erro: ${error}`
      showErrorToast(message)
      hasShownToast.current = true
      router.replace('/integracoes/conexao', { scroll: false })
    }
  }, [error, success, router])

  return null
}
