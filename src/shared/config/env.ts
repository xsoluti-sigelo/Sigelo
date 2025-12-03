import { z } from 'zod'
import { logger } from '@/shared/lib/logger'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'none']).default('info'),

  SECURE_COOKIES: z.string().optional(),
  ENABLE_METRICS: z.string().optional(),

  NEXT_PUBLIC_CONTA_AZUL_CLIENT_ID: z.string().min(1).optional(),
  CONTA_AZUL_CLIENT_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_CONTA_AZUL_REDIRECT_URI: z.string().url().optional(),
  CONTA_AZUL_SPTURIS_CUSTOMER_ID: z.string().optional(),
  CONTA_AZUL_PRODUCT_BANHEIRO_PADRAO_ID: z.string().optional(),
  CONTA_AZUL_PRODUCT_BANHEIRO_PCD_ID: z.string().optional(),
})

export function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    logger.error('Invalid environment variables', error as Error)
    throw new Error('Invalid environment variables')
  }
}

export type Env = z.infer<typeof envSchema>
