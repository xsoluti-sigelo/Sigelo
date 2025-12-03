import { NextRequest, NextResponse } from 'next/server'
import { getUserData } from '@/entities/user'
import { logger } from '@/shared/lib/logger'
import { ROUTES } from '@/shared/config/constants'
import { oauthCallbackQuerySchema } from '@/shared/lib/validations/integration'
import { exchangeContaAzulAuthCode, storeContaAzulTokens } from '@/features/integrations'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  logger.info('Conta Azul callback received', {
    hasCode: !!code,
    hasError: !!error,
    code: code ? code.substring(0, 10) + '...' : null,
    error,
    allParams: Object.fromEntries(searchParams.entries()),
  })

  const validationResult = oauthCallbackQuerySchema.safeParse({
    code: code || undefined,
    error: error || undefined,
  })

  if (!validationResult.success) {
    logger.error('Invalid OAuth callback parameters', {
      errors: validationResult.error.flatten(),
      receivedParams: { code: !!code, error: !!error },
    })
    return NextResponse.redirect(
      new URL(`${ROUTES.INTEGRATIONS}?error=invalid_params`, request.url),
    )
  }

  const { code: validCode, error: validError } = validationResult.data

  if (validError) {
    logger.error('OAuth error from Conta Azul', { error: validError })
    return NextResponse.redirect(new URL(`${ROUTES.INTEGRATIONS}?error=${validError}`, request.url))
  }

  if (!validCode) {
    logger.error('No authorization code received')
    return NextResponse.redirect(new URL(`${ROUTES.INTEGRATIONS}?error=no_code`, request.url))
  }

  try {
    const userData = await getUserData()

    if (!userData?.tenant_id) {
      throw new Error('User not authenticated')
    }

    const origin = `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000'}`
    const redirectUri = `${origin}/api/contaazul/callback`

    const tokens = await exchangeContaAzulAuthCode(validCode, redirectUri)

    await storeContaAzulTokens(tokens, userData.tenant_id, userData.id)

    logger.info('Conta Azul integration connected successfully', {
      tenantId: userData.tenant_id,
      userId: userData.id,
    })

    return NextResponse.redirect(
      new URL(`${ROUTES.INTEGRATIONS}?success=contaazul_connected`, request.url),
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error('Failed to complete OAuth flow', error as Error, {
      errorMessage,
      hasCode: !!code,
    })

    let errorParam = 'auth_failed'

    if (errorMessage.includes('Missing Conta Azul configuration')) {
      errorParam = 'config_missing'
    } else if (errorMessage.includes('User not authenticated')) {
      errorParam = 'user_not_authenticated'
    } else if (errorMessage.includes('Failed to exchange code')) {
      errorParam = 'token_exchange_failed'
    } else if (errorMessage.includes('Failed to store tokens')) {
      errorParam = 'store_failed'
    }

    return NextResponse.redirect(new URL(`${ROUTES.INTEGRATIONS}?error=${errorParam}`, request.url))
  }
}
