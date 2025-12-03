type EnvVariable = {
  key: string
  required: boolean
  description?: string
}

const REQUIRED_ENV_VARS: EnvVariable[] = [
  {
    key: 'NEXT_PUBLIC_CONTA_AZUL_CLIENT_ID',
    required: true,
    description: 'Conta Azul OAuth Client ID (public)',
  },
  {
    key: 'CONTA_AZUL_CLIENT_SECRET',
    required: true,
    description: 'Conta Azul OAuth Client Secret (server-side only)',
  },
]

export function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}. Please check your .env file.`)
  }
  return value
}

export function getOptionalEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue
}

export function validateIntegrationEnvVars(): {
  contaAzulClientId: string
  contaAzulClientSecret: string
} {
  const errors: string[] = []

  for (const envVar of REQUIRED_ENV_VARS) {
    if (envVar.required && !process.env[envVar.key]) {
      errors.push(`${envVar.key}: ${envVar.description || 'Required'}`)
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Missing required environment variables for integrations:\n${errors.join('\n')}`,
    )
  }

  return {
    contaAzulClientId: getRequiredEnv('NEXT_PUBLIC_CONTA_AZUL_CLIENT_ID'),
    contaAzulClientSecret: getRequiredEnv('CONTA_AZUL_CLIENT_SECRET'),
  }
}

export function getContaAzulConfig() {
  return {
    clientId: getRequiredEnv('NEXT_PUBLIC_CONTA_AZUL_CLIENT_ID'),
    clientSecret: getRequiredEnv('CONTA_AZUL_CLIENT_SECRET'),
    authUrl: 'https://auth.contaazul.com/oauth2/authorize',
    tokenUrl: 'https://auth.contaazul.com/oauth2/token',
    apiUrl: 'https://api-v2.contaazul.com',
    redirectUri: getOptionalEnv('NEXT_PUBLIC_CONTA_AZUL_REDIRECT_URI', '/api/contaazul/callback'),
  }
}
