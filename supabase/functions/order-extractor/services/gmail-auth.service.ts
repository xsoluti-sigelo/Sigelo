import { env } from '../config/environment.ts'
import { createLogger } from '../utils/logger.ts'
import { createClient } from '@supabase/supabase-js'

const logger = createLogger({ service: 'GmailAuthService' })

export interface GmailAuthTokens {
  accessToken: string
  expiresIn: number
  tokenType: string
  scope: string
}

export interface GmailCredentials {
  access_token: string
  refresh_token: string
  expires_at: number
  scope: string
  user_id: string
  gmail_user_id?: string
}

export interface GmailProfile {
  emailAddress: string
  messagesTotal: number
  threadsTotal: number
  historyId: string
  id?: string
}

export class GmailAuthService {
  private readonly clientId: string
  private readonly clientSecret: string
  private readonly refreshToken: string
  private readonly tokenEndpoint = 'https://oauth2.googleapis.com/token'
  private readonly profileEndpoint = 'https://www.googleapis.com/oauth2/v2/userinfo'

  private cachedAccessToken: string | null = null
  private tokenExpiryTime: number = 0

  constructor() {
    this.clientId = env.gmail.clientId
    this.clientSecret = env.gmail.clientSecret
    this.refreshToken = env.gmail.refreshToken

    if (!this.clientId || !this.clientSecret || !this.refreshToken) {
      throw new Error('Gmail OAuth2 credentials not configured')
    }

    logger.info('Gmail Auth Service initialized')
  }

  async getAccessToken(): Promise<string> {
    const now = Date.now()
    if (this.cachedAccessToken && this.tokenExpiryTime > now + 5 * 60 * 1000) {
      logger.info('Using cached access token')
      return this.cachedAccessToken
    }

    logger.info('Refreshing access token')
    const tokens = await this.refreshAccessToken()

    this.cachedAccessToken = tokens.accessToken
    this.tokenExpiryTime = now + tokens.expiresIn * 1000

    return tokens.accessToken
  }

  private async refreshAccessToken(): Promise<GmailAuthTokens> {
    try {
      const response = await fetch(this.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error('Failed to refresh access token', {
          status: response.status,
          error: errorText,
        })
        throw new Error(`Failed to refresh token: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      logger.info('Access token refreshed successfully', {
        expiresIn: data.expires_in,
      })

      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
      }
    } catch (error) {
      logger.error('Error refreshing access token', error)
      throw new Error(`Failed to refresh Gmail access token: ${(error as Error).message}`)
    }
  }

  validateConfig(): boolean {
    return !!(this.clientId && this.clientSecret && this.refreshToken)
  }

  async testAuthentication(): Promise<boolean> {
    try {
      const token = await this.getAccessToken()
      return !!token
    } catch (error) {
      logger.error('Authentication test failed', error)
      return false
    }
  }

  async validateGmailConnection(): Promise<{ isValid: boolean; profile?: GmailProfile }> {
    try {
      logger.info('Validating Gmail API connection')

      const accessToken = await this.getAccessToken()

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        logger.error('Failed to validate Gmail connection', {
          status: response.status,
          statusText: response.statusText,
        })
        return { isValid: false }
      }

      const profileData = await response.json()

      const profile: GmailProfile = {
        emailAddress: profileData.emailAddress,
        messagesTotal: profileData.messagesTotal || 0,
        threadsTotal: profileData.threadsTotal || 0,
        historyId: profileData.historyId || '',
        id: profileData.id,
      }

      logger.info('Gmail connection validated successfully', {
        emailAddress: profile.emailAddress,
        messagesTotal: profile.messagesTotal,
        threadsTotal: profile.threadsTotal,
      })

      return { isValid: true, profile }
    } catch (error) {
      logger.error('Error validating Gmail connection', error)
      return { isValid: false }
    }
  }

  generateAuthUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      scope:
        'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.metadata',
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      state: state,
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    logger.info('Authorization URL generated', { state })

    return authUrl
  }

  async exchangeCodeForTokens(
    code: string,
    redirectUri: string,
    userId: string,
  ): Promise<GmailCredentials | null> {
    try {
      logger.info('Exchanging authorization code for tokens', { userId })

      const response = await fetch(this.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      })

      const tokenData = await response.json()

      if (!response.ok) {
        logger.error('Failed to exchange code for tokens', {
          status: response.status,
          error: tokenData.error,
        })
        return null
      }

      const profileResponse = await fetch(
        `${this.profileEndpoint}?access_token=${tokenData.access_token}`,
      )
      const profile = await profileResponse.json()

      const credentials: GmailCredentials = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: Date.now() + tokenData.expires_in * 1000,
        scope: tokenData.scope,
        user_id: userId,
        gmail_user_id: profile.id,
      }

      logger.info('Tokens obtained successfully', {
        userId,
        email: profile.email,
        expiresIn: tokenData.expires_in,
      })

      return credentials
    } catch (error) {
      logger.error('Error exchanging code for tokens', error)
      return null
    }
  }

  async saveUserCredentials(credentials: GmailCredentials): Promise<boolean> {
    try {
      logger.info('Saving user credentials', { userId: credentials.user_id })

      const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey)

      const { error } = await supabase.from('user_gmail_credentials').upsert({
        user_id: credentials.user_id,
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token,
        expires_at: credentials.expires_at,
        scope: credentials.scope,
        gmail_user_id: credentials.gmail_user_id,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        logger.error('Failed to save user credentials', { error: error.message })
        return false
      }

      logger.info('User credentials saved successfully', { userId: credentials.user_id })
      return true
    } catch (error) {
      logger.error('Error saving user credentials', error)
      return false
    }
  }

  async getUserCredentials(userId: string): Promise<GmailCredentials | null> {
    try {
      logger.info('Retrieving user credentials', { userId })

      const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey)

      const { data, error } = await supabase
        .from('user_gmail_credentials')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        logger.error('Failed to retrieve user credentials', { error: error.message })
        return null
      }

      if (!data) {
        logger.info('No credentials found for user', { userId })
        return null
      }

      logger.info('User credentials retrieved successfully', { userId })
      return data
    } catch (error) {
      logger.error('Error retrieving user credentials', error)
      return null
    }
  }

  async validateUserAuthentication(userId: string): Promise<{
    success: boolean
    isAuthenticated: boolean
    hasValidToken: boolean
    tokenExpiresAt?: number
    gmailProfile?: GmailProfile
    errors: string[]
    processingTime: number
    timestamp: string
  }> {
    const startTime = Date.now()
    const errors: string[] = []

    try {
      logger.info('Starting user authentication validation', { userId })

      const credentials = await this.getUserCredentials(userId)

      if (!credentials) {
        errors.push('Credenciais não encontradas')
        return {
          success: false,
          isAuthenticated: false,
          hasValidToken: false,
          errors,
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        }
      }

      const now = Date.now()
      const isExpired = now >= credentials.expires_at

      if (isExpired) {
        errors.push('Token expirado')
        return {
          success: false,
          isAuthenticated: false,
          hasValidToken: false,
          tokenExpiresAt: credentials.expires_at,
          errors,
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        }
      }

      const connectionValidation = await this.validateGmailConnection()

      if (!connectionValidation.isValid) {
        errors.push('Falha na conectividade com Gmail API')
        return {
          success: false,
          isAuthenticated: false,
          hasValidToken: false,
          tokenExpiresAt: credentials.expires_at,
          errors,
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        }
      }

      logger.info('User authentication validated successfully', { userId })

      return {
        success: true,
        isAuthenticated: true,
        hasValidToken: true,
        tokenExpiresAt: credentials.expires_at,
        gmailProfile: connectionValidation.profile,
        errors,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      logger.error('Error in user authentication validation', error)

      return {
        success: false,
        isAuthenticated: false,
        hasValidToken: false,
        errors: [...errors, `Erro inesperado: ${error}`],
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      }
    }
  }
}
