'use client'

import { Card, Button } from '@/shared/ui'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { useContaAzulConnectionHandlers } from '../hooks/useContaAzulConnectionHandlers'
import { getRelativeTime, isExpired as checkExpired } from '../lib/date-utils'

interface ContaAzulCardProps {
  isConnected: boolean
  lastSyncAt?: string
  expiresAt?: number
  connectedBy?: string
}

export function ContaAzulCard({
  isConnected,
  lastSyncAt,
  expiresAt,
  connectedBy,
}: ContaAzulCardProps) {
  const { handleConnect, handleDisconnect, handleRefreshToken, isConnecting, isPending } =
    useContaAzulConnectionHandlers()

  const isExpired = checkExpired(expiresAt)

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center">
            <Image
              src="/assets/integrations/contaazul/logo.png"
              alt="Conta Azul"
              width={140}
              height={48}
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConnected && !isExpired && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium rounded-full">
              <span className="w-1.5 h-1.5 bg-green-600 dark:bg-green-400 rounded-full"></span>
              Conectado
            </span>
          )}
          {isConnected && isExpired && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs font-medium rounded-full">
              <span className="w-1.5 h-1.5 bg-yellow-600 dark:bg-yellow-400 rounded-full"></span>
              Acesso expirado
            </span>
          )}
          {!isConnected && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 text-xs font-medium rounded-full">
              <span className="w-1.5 h-1.5 bg-gray-600 dark:bg-gray-400 rounded-full"></span>
              Desconectado
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">Última sincronização:</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            {getRelativeTime(lastSyncAt)}
          </span>
        </div>

        {isConnected && connectedBy && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Conectado por:</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">{connectedBy}</span>
          </div>
        )}

        {isConnected && (
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span>Gerar faturas automaticamente</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span>Sincronizar clientes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span>Sincronizar serviços prestados</span>
            </div>
          </div>
        )}

        {!isConnected && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Conecte sua conta Conta Azul para gerar faturas automaticamente a partir dos eventos.
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {!isConnected ? (
          <Button onClick={handleConnect} isLoading={isConnecting} className="flex-1">
            {isConnecting ? 'Conectando...' : 'Conectar Conta Azul'}
          </Button>
        ) : (
          <>
            {isExpired && (
              <Button onClick={handleRefreshToken} disabled={isPending} className="flex-1">
                Reconectar
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleDisconnect}
              disabled={isPending}
              className="flex-1"
            >
              Desconectar
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}
