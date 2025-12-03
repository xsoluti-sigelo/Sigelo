import { serve } from '@std/http'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GmailAuthService } from './services/gmail-auth.service.ts'
import { createLogger } from './utils/logger.ts'
import {
  handleProcessEmail,
  handleProcessBatch,
  handleProcessUnprocessed,
  handleProcessingStats,
  handleTestExtraction,
  handleTestMOLIDE,
} from './handlers/email-processing.handler.ts'
import {
  handleListEmails,
  handleGetEmail,
  handleSearchOrderEmails,
  handleFetchAndProcess,
} from './handlers/gmail-reading.handler.ts'

const logger = createLogger({ service: 'OrderExtractorMain' })

// Capture env vars before Supabase removes them
// Force redeploy to pick up new DEFAULT_TENANT_ID secret
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const GMAPS_API_KEY = Deno.env.get('GMAPS_API_KEY') ?? ''

serve(async (req) => {
  // Inicializa cliente Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
  const url = new URL(req.url)
  const path = url.pathname

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (path === '/order-extractor' && req.method === 'GET') {
      const result = {
        success: true,
        message: 'Serviço Order Extractor está em execução',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        tenantId: Deno.env.get('DEFAULT_TENANT_ID') ?? 'NOT_SET',
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (path === '/order-extractor/auth/test' && req.method === 'GET') {
      logger.info('Testando autenticação Gmail')

      try {
        const authService = new GmailAuthService()
        const isValid = await authService.testAuthentication()

        const result = {
          success: isValid,
          message: isValid ? 'Autenticação Gmail bem-sucedida' : 'Falha na autenticação Gmail',
          timestamp: new Date().toISOString(),
          configValid: authService.validateConfig(),
        }

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      } catch (error) {
        logger.error('Erro ao testar autenticação Gmail', error)

        const result = {
          success: false,
          error: (error as Error).message,
          timestamp: new Date().toISOString(),
        }

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }
    }

    if (path === '/order-extractor/auth/validate' && req.method === 'POST') {
      const body = await req.json()
      const { userId } = body

      if (!userId) {
        return new Response(JSON.stringify({ success: false, error: 'userId é obrigatório' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      logger.info('Validando autenticação do usuário', { userId })

      try {
        const authService = new GmailAuthService()
        const result = await authService.validateUserAuthentication(userId)

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      } catch (error) {
        logger.error('Erro ao validar autenticação do usuário', error)

        const result = {
          success: false,
          error: (error as Error).message,
          timestamp: new Date().toISOString(),
        }

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }
    }

    if (path === '/order-extractor/auth/url' && req.method === 'POST') {
      const body = await req.json()
      const { redirectUri, userId } = body

      if (!redirectUri || !userId) {
        return new Response(
          JSON.stringify({ success: false, error: 'redirectUri e userId são obrigatórios' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          },
        )
      }

      logger.info('Gerando URL de autorização', { userId })

      try {
        const authService = new GmailAuthService()
        const state = generateSecureState()
        const authUrl = authService.generateAuthUrl(redirectUri, state)

        const result = {
          success: true,
          authUrl,
          state,
          expiresIn: 300,
          timestamp: new Date().toISOString(),
        }

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      } catch (error) {
        logger.error('Erro ao gerar URL de autorização', error)

        const result = {
          success: false,
          error: (error as Error).message,
          timestamp: new Date().toISOString(),
        }

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }
    }

    if (path === '/order-extractor/auth/exchange' && req.method === 'POST') {
      const body = await req.json()
      const { code, redirectUri, userId } = body

      if (!code || !redirectUri || !userId) {
        return new Response(
          JSON.stringify({ success: false, error: 'code, redirectUri e userId são obrigatórios' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          },
        )
      }

      logger.info('Trocando código por tokens', { userId })

      try {
        const authService = new GmailAuthService()
        const credentials = await authService.exchangeCodeForTokens(code, redirectUri, userId)

        if (!credentials) {
          return new Response(
            JSON.stringify({ success: false, error: 'Falha ao trocar código por tokens' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            },
          )
        }

        const saved = await authService.saveUserCredentials(credentials)

        if (!saved) {
          return new Response(
            JSON.stringify({ success: false, error: 'Falha ao salvar credenciais' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            },
          )
        }

        const result = {
          success: true,
          message: 'Tokens obtidos e salvos com sucesso',
          timestamp: new Date().toISOString(),
        }

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      } catch (error) {
        logger.error('Erro ao trocar código por tokens', error)

        const result = {
          success: false,
          error: (error as Error).message,
          timestamp: new Date().toISOString(),
        }

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }
    }

    if (path === '/order-extractor/auth/refresh' && req.method === 'POST') {
      const body = await req.json()
      const { userId } = body

      if (!userId) {
        return new Response(JSON.stringify({ success: false, error: 'userId é obrigatório' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      logger.info('Renovando token', { userId })

      try {
        const authService = new GmailAuthService()
        const validToken = await authService.getAccessToken()

        if (!validToken) {
          return new Response(JSON.stringify({ success: false, error: 'Falha ao renovar token' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          })
        }

        const result = {
          success: true,
          message: 'Token renovado com sucesso',
          timestamp: new Date().toISOString(),
        }

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      } catch (error) {
        logger.error('Erro ao renovar token', error)

        const result = {
          success: false,
          error: (error as Error).message,
          timestamp: new Date().toISOString(),
        }

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }
    }

    if (path === '/order-extractor/auth/validate-connection' && req.method === 'POST') {
      const body = await req.json()
      const { userId } = body

      if (!userId) {
        return new Response(JSON.stringify({ success: false, error: 'userId é obrigatório' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      logger.info('Validando conectividade com Gmail', { userId })

      try {
        const authService = new GmailAuthService()
        const connectionResult = await authService.validateGmailConnection()

        if (!connectionResult.isValid) {
          return new Response(
            JSON.stringify({ success: false, error: 'Falha ao validar conexão com Gmail' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            },
          )
        }

        const result = {
          success: true,
          message: 'Conectividade com Gmail validada com sucesso',
          profile: connectionResult.profile,
          timestamp: new Date().toISOString(),
        }

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      } catch (error) {
        logger.error('Erro ao validar conectividade com Gmail', error)

        const result = {
          success: false,
          error: (error as Error).message,
          timestamp: new Date().toISOString(),
        }

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }
    }

    // ============================================================================
    // ENDPOINTS DE PROCESSAMENTO DE EMAILS
    // ============================================================================

    // Processar email individual
    if (path === '/order-extractor/process/email' && req.method === 'POST') {
      return await handleProcessEmail(
        supabase,
        req,
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
        GMAPS_API_KEY,
      )
    }

    // Processar emails em lote
    if (path === '/order-extractor/process/batch' && req.method === 'POST') {
      return await handleProcessBatch(
        supabase,
        req,
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
        GMAPS_API_KEY,
      )
    }

    // Processar emails não processados
    if (path === '/order-extractor/process/unprocessed' && req.method === 'POST') {
      return await handleProcessUnprocessed(
        supabase,
        req,
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
        GMAPS_API_KEY,
      )
    }

    // Estatísticas de processamento
    if (path === '/order-extractor/process/stats' && req.method === 'GET') {
      return await handleProcessingStats(
        supabase,
        req,
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
        GMAPS_API_KEY,
      )
    }

    // Teste de extração de dados
    if (path === '/order-extractor/test/extraction' && req.method === 'POST') {
      return await handleTestExtraction(supabase, req)
    }

    // Teste de cálculo MOLIDE
    if (path === '/order-extractor/test/molide' && req.method === 'POST') {
      return await handleTestMOLIDE(supabase, req)
    }

    // ============================================================================
    // ENDPOINTS DE LEITURA DO GMAIL
    // ============================================================================

    // Listar emails do Gmail
    if (path === '/order-extractor/gmail/list' && req.method === 'GET') {
      return await handleListEmails(supabase, req)
    }

    // Obter email específico
    if (path === '/order-extractor/gmail/get' && req.method === 'GET') {
      return await handleGetEmail(supabase, req)
    }

    // Buscar emails de ordem de serviço
    if (path === '/order-extractor/gmail/search-orders' && req.method === 'GET') {
      return await handleSearchOrderEmails(supabase, req)
    }

    // Buscar e processar automaticamente
    if (path === '/order-extractor/gmail/fetch-and-process' && req.method === 'POST') {
      return await handleFetchAndProcess(
        supabase,
        req,
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
        GMAPS_API_KEY,
      )
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Endpoint não encontrado',
        availableRoutes: [
          'GET  /order-extractor                        - Verificação de saúde',
          'GET  /order-extractor/auth/test              - Testa autenticação Gmail',
          'POST /order-extractor/auth/validate          - Valida autenticação do usuário',
          'POST /order-extractor/auth/url               - Gera URL de autorização OAuth2',
          'POST /order-extractor/auth/exchange          - Troca código por tokens',
          'POST /order-extractor/auth/refresh           - Renova token de acesso',
          'POST /order-extractor/auth/validate-connection - Valida conectividade Gmail',
          'POST /order-extractor/process/email          - Processa email individual',
          'POST /order-extractor/process/batch          - Processa emails em lote',
          'POST /order-extractor/process/unprocessed    - Processa emails não processados',
          'GET  /order-extractor/process/stats          - Estatísticas de processamento',
          'POST /order-extractor/test/extraction        - Testa extração de dados',
          'POST /order-extractor/test/molide            - Testa cálculo MOLIDE',
          'GET  /order-extractor/gmail/list             - Lista emails do Gmail',
          'GET  /order-extractor/gmail/get              - Obtém email específico',
          'GET  /order-extractor/gmail/search-orders    - Busca emails de ordem',
          'POST /order-extractor/gmail/fetch-and-process - Busca e processa automaticamente',
        ],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      },
    )
  } catch (error) {
    logger.error('Erro não tratado no handler de requisição', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message || 'Erro interno do servidor',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

function generateSecureState(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2)
  return `${timestamp}-${random}`
}

logger.info('Função Order Extractor Edge iniciada')
