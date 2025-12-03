import type {
  AuthRequest,
  AuthResponse,
  AuthUrlResponse,
  TokenExchangeRequest,
  TokenExchangeResponse,
  AuthAction,
} from '../types/auth.ts'
import { GoogleAuthService } from '../services/auth.service.ts'
import { logger } from '../utils/logger.ts'
import { validateEnvironment } from '../config/environment.ts'

export async function handleValidateAuth(request: AuthRequest): Promise<AuthResponse> {
  const startTime = Date.now()

  try {
    logger.info(`Iniciando validação de autenticação`, request.userId, AuthAction.VALIDATE_TOKEN)

    if (!request.userId) {
      return {
        success: false,
        errors: ['User ID é obrigatório'],
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      }
    }

    const authService = new GoogleAuthService()
    const result = await authService.validateUserAuthentication(request.userId)

    return {
      success: result.success,
      data: result,
      errors: result.errors,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
    }
  } catch (error) {
    logger.error(
      `Erro no handler de validação: ${error}`,
      request.userId,
      AuthAction.VALIDATE_TOKEN,
    )

    return {
      success: false,
      errors: [`Erro inesperado: ${error}`],
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
    }
  }
}

export function handleGenerateAuthUrl(request: AuthRequest): Promise<AuthResponse> {
  const startTime = Date.now()

  try {
    logger.info(`Gerando URL de autorização`, request.userId, AuthAction.GENERATE_AUTH_URL)

    const envValidation = validateEnvironment()
    if (!envValidation.isValid) {
      return {
        success: false,
        errors: [`Configurações de ambiente inválidas: ${envValidation.missingVars.join(', ')}`],
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      }
    }

    if (!request.redirectUri) {
      return {
        success: false,
        errors: ['Redirect URI é obrigatório'],
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      }
    }

    const authService = new GoogleAuthService()
    const state = generateSecureState()
    const authUrl = authService.generateAuthUrl(request.redirectUri, state)

    const response: AuthUrlResponse = {
      authUrl,
      state,
      expiresIn: 300, // 5 minutos
    }

    logger.info(
      `URL de autorização gerada com sucesso`,
      request.userId,
      AuthAction.GENERATE_AUTH_URL,
    )

    return {
      success: true,
      data: response,
      errors: [],
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
    }
  } catch (error) {
    logger.error(
      `Erro no handler de geração de URL: ${error}`,
      request.userId,
      AuthAction.GENERATE_AUTH_URL,
    )

    return {
      success: false,
      errors: [`Erro inesperado: ${error}`],
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
    }
  }
}

export async function handleExchangeCode(
  request: TokenExchangeRequest,
): Promise<TokenExchangeResponse> {
  const startTime = Date.now()

  try {
    logger.info(`Trocando código por tokens`, undefined, AuthAction.EXCHANGE_CODE)

    if (!request.code || !request.redirectUri || !request.state) {
      return {
        success: false,
        errors: ['Código, redirect URI e state são obrigatórios'],
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      }
    }

    const envValidation = validateEnvironment()
    if (!envValidation.isValid) {
      return {
        success: false,
        errors: [`Configurações de ambiente inválidas: ${envValidation.missingVars.join(', ')}`],
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      }
    }

    const authService = new GoogleAuthService()

    // TODO: Extrair userId do state ou de outro lugar seguro
    // Por enquanto, vamos usar um placeholder
    const userId = 'temp-user-id' // Isso deve ser implementado de forma segura

    // Troca código por tokens
    const credentials = await authService.exchangeCodeForTokens(
      request.code,
      request.redirectUri,
      userId,
    )

    if (!credentials) {
      return {
        success: false,
        errors: ['Falha ao trocar código por tokens'],
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      }
    }

    const saved = await authService.saveUserCredentials(credentials)

    if (!saved) {
      return {
        success: false,
        errors: ['Falha ao salvar credenciais'],
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      }
    }

    logger.info(`Código trocado por tokens com sucesso`, userId, AuthAction.EXCHANGE_CODE)

    return {
      success: true,
      credentials,
      errors: [],
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
    }
  } catch (error) {
    logger.error(
      `Erro no handler de troca de código: ${error}`,
      undefined,
      AuthAction.EXCHANGE_CODE,
    )

    return {
      success: false,
      errors: [`Erro inesperado: ${error}`],
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
    }
  }
}

export async function handleRefreshToken(request: AuthRequest): Promise<AuthResponse> {
  const startTime = Date.now()

  try {
    logger.info(`Renovando token`, request.userId, AuthAction.REFRESH_TOKEN)

    if (!request.userId) {
      return {
        success: false,
        errors: ['User ID é obrigatório'],
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      }
    }

    const authService = new GoogleAuthService()

    // Obtém token válido (renova se necessário)
    const validToken = await authService.getValidAccessToken(request.userId)

    if (!validToken) {
      return {
        success: false,
        errors: ['Não foi possível renovar o token'],
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      }
    }

    logger.info(`Token renovado com sucesso`, request.userId, AuthAction.REFRESH_TOKEN)

    return {
      success: true,
      data: { accessToken: validToken },
      errors: [],
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
    }
  } catch (error) {
    logger.error(`Erro no handler de renovação: ${error}`, request.userId, AuthAction.REFRESH_TOKEN)

    return {
      success: false,
      errors: [`Erro inesperado: ${error}`],
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
    }
  }
}

export async function handleValidateConnection(request: AuthRequest): Promise<AuthResponse> {
  const startTime = Date.now()

  try {
    logger.info(`Validando conectividade`, request.userId, AuthAction.VALIDATE_CONNECTION)

    if (!request.userId) {
      return {
        success: false,
        errors: ['User ID é obrigatório'],
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      }
    }

    const authService = new GoogleAuthService()

    // Obtém token válido
    const validToken = await authService.getValidAccessToken(request.userId)

    if (!validToken) {
      return {
        success: false,
        errors: ['Não foi possível obter token válido'],
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      }
    }

    // Valida conectividade com Gmail
    const connectionResult = await authService.validateGmailConnection(validToken, request.userId)

    if (!connectionResult.isValid) {
      return {
        success: false,
        errors: ['Falha na conectividade com Gmail API'],
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      }
    }

    logger.info(
      `Conectividade validada com sucesso`,
      request.userId,
      AuthAction.VALIDATE_CONNECTION,
    )

    return {
      success: true,
      data: {
        isValid: true,
        profile: connectionResult.profile,
      },
      errors: [],
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
    }
  } catch (error) {
    logger.error(
      `Erro no handler de validação de conectividade: ${error}`,
      request.userId,
      AuthAction.VALIDATE_CONNECTION,
    )

    return {
      success: false,
      errors: [`Erro inesperado: ${error}`],
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
    }
  }
}

function generateSecureState(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2)
  return `${timestamp}-${random}`
}

export function validateState(state: string): boolean {
  if (!state) return false

  const parts = state.split('-')
  if (parts.length !== 2) return false

  const timestamp = parseInt(parts[0])
  const now = Date.now()

  return now - timestamp < 300000
}
