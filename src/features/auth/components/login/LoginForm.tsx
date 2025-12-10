'use client'

import { LoginBranding } from './LoginBranding'
import { LoginHeader } from './LoginHeader'
import { LoginFooter } from './LoginFooter'
import { GoogleButton } from './GoogleButton'
import { useInviteSession } from '@/features/auth/hooks/useInviteSession'
import { ErrorMessage } from './ErrorMessage'
import { Loader2 } from 'lucide-react'

export function LoginForm() {
  const { isProcessing, error } = useInviteSession()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-5xl h-[75vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex">
        <LoginBranding />

        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <LoginHeader />

            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Processando convite...</p>
              </div>
            ) : (
              <>
                {error && <ErrorMessage message={error} />}
                <GoogleButton />
              </>
            )}

            <LoginFooter />
          </div>
        </div>
      </div>
    </div>
  )
}
