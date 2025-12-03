declare const Deno: {
  env: {
    get(key: string): string | undefined
  }
}

export const env = {
  supabase: {
    url: Deno.env.get('SUPABASE_URL') ?? '',
    anonKey: Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    serviceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  },
  gmail: {
    clientId: Deno.env.get('GMAIL_CLIENT_ID') ?? '',
    clientSecret: Deno.env.get('GMAIL_CLIENT_SECRET') ?? '',
    refreshToken: Deno.env.get('GMAIL_REFRESH_TOKEN') ?? '',
  },
  google: {
    clientId: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
    clientSecret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
    mapsApiKey: Deno.env.get('GMAPS_API_KEY') ?? '',
  },
  app: {
    defaultTenantId: Deno.env.get('DEFAULT_TENANT_ID') ?? '',
    supplierEmail: Deno.env.get('SUPPLIER_EMAIL') ?? '',
    standardServiceId: Deno.env.get('CONTA_AZUL_SERVICE_STANDARD_ID') ?? '',
    pcdServiceId: Deno.env.get('CONTA_AZUL_SERVICE_PCD_ID') ?? '',
    standardServiceCAId: Deno.env.get('CONTA_AZUL_SERVICE_STANDARD_CAID') ?? '',
    pcdServiceCAId: Deno.env.get('CONTA_AZUL_SERVICE_PCD_CAID') ?? '',
    clientContaAzulId: Deno.env.get('CONTA_AZUL_CLIENT_CAID') ?? '',
  },
}
