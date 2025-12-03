import { Breadcrumb } from '@/shared/ui'
import { ContaAzulCard } from '@/features/integrations'
import { IntegrationErrorAlert } from '@/features/integrations/components/IntegrationErrorAlert'
import { getContaAzulStatus } from '@/features/integrations/actions'
import { Suspense } from 'react'
import { CubeIcon } from '@heroicons/react/24/outline'

export const metadata = {
  title: 'Conexão | Sigelo',
  description: 'Gerencie suas conexões com sistemas externos',
}

async function IntegrationContent() {
  const contaAzulStatus = await getContaAzulStatus()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ContaAzulCard
        isConnected={contaAzulStatus.isConnected}
        lastSyncAt={contaAzulStatus.lastSyncAt}
        expiresAt={contaAzulStatus.expiresAt}
        connectedBy={contaAzulStatus.connectedBy}
      />

      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-3">
          <CubeIcon className="w-7 h-7 text-gray-500 dark:text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Mais conexões em breve
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Estamos trabalhando para trazer mais conexões úteis para você.
        </p>
      </div>
    </div>
  )
}

export default function ConexaoPage() {
  return (
    <div className="p-8 w-full">
      <div className="max-w-[1600px] mx-auto">
        <Breadcrumb
          items={[{ label: 'Integrações', href: '/integracoes/conexao' }, { label: 'Conexão' }]}
          className="mb-6"
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Conexão</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Conecte o Sigelo com seus sistemas externos favoritos
          </p>
        </div>

        <IntegrationErrorAlert />

        <Suspense
          fallback={
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
            </div>
          }
        >
          <IntegrationContent />
        </Suspense>
      </div>
    </div>
  )
}
