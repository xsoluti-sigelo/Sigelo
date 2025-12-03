'use client'

import { Button } from '@/shared/ui/Button'
import { useGoogleSignIn } from '@/features/auth/hooks/useGoogleSignIn'
import { ErrorMessage } from './ErrorMessage'
import { GoogleIcon } from './GoogleIcon'

export function GoogleButton() {
  const { signIn, isLoading, error } = useGoogleSignIn()

  return (
    <div className="space-y-3">
      {error && <ErrorMessage message={error} />}

      <Button
        variant="secondary"
        size="lg"
        onClick={signIn}
        isLoading={isLoading}
        className="w-full gap-3"
      >
        {!isLoading && <GoogleIcon />}
        <span>Continuar com Google</span>
      </Button>
    </div>
  )
}
