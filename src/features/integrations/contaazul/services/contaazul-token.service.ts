'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { logger } from '@/shared/lib/logger'
import type { ContaAzulTokens } from '../types/contaazul.types'
import { isContaAzulTokenExpired } from '../lib/contaazul-utils'
import { getContaAzulConfig } from '../lib/env-validator'

const CONTA_AZUL_AUTH_URL = 'https://auth.contaazul.com/oauth2'

export async function storeContaAzulTokens(
  tokens: ContaAzulTokens,
  tenantId: string,
  connectedBy?: string,
): Promise<void> {
  const supabase = await createClient()

  const credentials = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_in: tokens.expires_in,
    expires_at: tokens.expires_at,
    token_type: tokens.token_type,
  }

  const { error } = await supabase.rpc('store_encrypted_credentials', {
    p_tenant_id: tenantId,
    p_integration_type: 'CONTA_AZUL',
    p_credentials: credentials,
    p_connected_by: connectedBy || undefined,
  })

  if (error) {
    logger.error('Failed to store credentials in Vault', error)
    throw new Error(`Failed to store credentials: ${error.message}`)
  }

  logger.info('Tokens stored/updated successfully in Vault (encrypted)', { tenantId, connectedBy })
}

export async function getContaAzulTokens(tenantId: string): Promise<ContaAzulTokens | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_decrypted_credentials', {
    p_tenant_id: tenantId,
    p_integration_type: 'CONTA_AZUL',
  })

  if (error) {
    logger.error('Failed to get credentials from Vault', error)
    return null
  }

  if (!data) {
    logger.error('No credentials found', { tenantId })
    return null
  }

  return data as unknown as ContaAzulTokens
}

export async function exchangeContaAzulAuthCode(
  code: string,
  redirectUri: string,
): Promise<ContaAzulTokens> {
  const config = getContaAzulConfig()

  if (!redirectUri) {
    throw new Error('Redirect URI is required')
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: redirectUri,
  })

  const response = await fetch(`${CONTA_AZUL_AUTH_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    logger.error('Failed to exchange code for tokens', { error: errorData })
    throw new Error(
      `Failed to exchange code for tokens: ${errorData.error_description || response.statusText}`,
    )
  }

  const data = await response.json()

  const tokens: ContaAzulTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    token_type: data.token_type,
    expires_at: Date.now() + data.expires_in * 1000,
  }

  logger.info('Authorization code exchanged successfully')

  return tokens
}

export async function refreshContaAzulTokens(
  refreshToken: string,
  tenantId: string,
): Promise<ContaAzulTokens> {
  const config = getContaAzulConfig()

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  })

  const response = await fetch(`${CONTA_AZUL_AUTH_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    logger.error('Failed to refresh tokens', { error: errorData, tenantId })
    throw new Error(
      `Failed to refresh tokens: ${errorData.error_description || response.statusText}`,
    )
  }

  const data = await response.json()

  if (!data.access_token || !data.expires_in) {
    logger.error('Invalid token response from Conta Azul', { data, tenantId })
    throw new Error(
      'Failed to refresh tokens: Invalid response from Conta Azul API (missing access_token or expires_in)',
    )
  }

  const tokens: ContaAzulTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expires_in: data.expires_in,
    token_type: data.token_type,
    expires_at: Date.now() + data.expires_in * 1000,
  }

  await storeContaAzulTokens(tokens, tenantId)

  logger.info('Tokens refreshed successfully', { tenantId })

  return tokens
}

export async function getValidContaAzulAccessToken(tenantId: string): Promise<string> {
  const tokens = await getContaAzulTokens(tenantId)

  if (!tokens) {
    throw new Error('No tokens found for tenant')
  }

  if (isContaAzulTokenExpired(tokens)) {
    logger.info('Token expired, refreshing...', { tenantId })
    const newTokens = await refreshContaAzulTokens(tokens.refresh_token, tenantId)
    return newTokens.access_token
  }

  return tokens.access_token
}

export async function deleteContaAzulTokens(tenantId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('integrations' as never)
    .update({ is_active: false } as never)
    .eq('tenant_id', tenantId)
    .eq('integration_type', 'CONTA_AZUL')

  if (error) {
    logger.error('Failed to delete tokens', error)
    throw new Error(`Failed to delete tokens: ${error.message}`)
  }

  logger.info('Tokens deleted successfully', { tenantId })
}
