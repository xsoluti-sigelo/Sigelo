'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/shared/ui'
import { logger } from '@/shared/lib/logger'

export const dynamic = 'force-dynamic'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      logger.error('Global error', error, { digest: error.digest })
    }
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="mx-auto mb-6">
            <Image
              src="/assets/images/undraw_fixing-bugs_13mt.svg"
              alt="Fixing bugs illustration"
              width={300}
              height={195}
              className="mx-auto"
              priority
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Ops! Algo deu errado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error.message || 'Ocorreu um erro inesperado. Estamos trabalhando para resolver.'}
          </p>

          {process.env.NODE_ENV === 'development' && error.stack && (
            <details className="mb-6 text-left">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                Ver detalhes técnicos
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-40">
                {error.stack}
              </pre>
            </details>
          )}

          <div className="space-y-3">
            <Button onClick={reset} className="w-full">
              Tentar novamente
            </Button>
            <Link
              href="/"
              className="block w-full px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
            >
              Voltar ao início
            </Link>
          </div>

          {error.digest && (
            <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
              Error ID: {error.digest}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
