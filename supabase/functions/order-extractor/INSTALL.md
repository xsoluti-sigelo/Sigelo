# Instruções de Instalação - Order Extractor

## Pré-requisitos

1. **Supabase Project** configurado
2. **Google Cloud Console** configurado com Gmail API
3. **Credenciais OAuth2** do Google configuradas

## Passo 1: Executar Schema Ideal

**IMPORTANTE:** Execute primeiro o schema ideal que já está pronto:

```bash
# Execute o schema ideal primeiro
psql -h your-supabase-host -U postgres -d postgres -f scripts/ideal-database-schema.sql
```

Ou através do Supabase Dashboard:

1. Vá para SQL Editor
2. Copie e cole o conteúdo de `scripts/ideal-database-schema.sql`
3. Execute o script

## Passo 2: Executar Tabelas de Autenticação

Depois de executar o schema ideal, execute as tabelas específicas para autenticação:

```bash
# Execute as tabelas de autenticação
psql -h your-supabase-host -U postgres -d postgres -f supabase/functions/order-extractor/sql/create-tables.sql
```

Ou através do Supabase Dashboard:

1. Vá para SQL Editor
2. Copie e cole o conteúdo de `supabase/functions/order-extractor/sql/create-tables.sql`
3. Execute o script

## Passo 3: Configurar Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no Supabase:

### Supabase

- `SUPABASE_URL` - URL do seu projeto Supabase
- `SUPABASE_ANON_KEY` - Chave anônima do Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço do Supabase

### Gmail OAuth2

- `GMAIL_CLIENT_ID` - ID do cliente OAuth2 do Gmail
- `GMAIL_CLIENT_SECRET` - Segredo do cliente OAuth2 do Gmail
- `GMAIL_REFRESH_TOKEN` - Token de renovação do Gmail

### Google OAuth2 (para novos usuários)

- `GOOGLE_CLIENT_ID` - ID do cliente OAuth2 do Google
- `GOOGLE_CLIENT_SECRET` - Segredo do cliente OAuth2 do Google

### Aplicação

- `DEFAULT_TENANT_ID` - ID do tenant padrão
- `SUPPLIER_EMAIL` - Email do fornecedor (ex: ORDEMFORNECIMENTO@SPTURIS.COM)

## Passo 4: Deploy da Função

Deploy da função para o Supabase:

```bash
# Deploy da função
supabase functions deploy order-extractor
```

## Passo 5: Testar a Função

Teste se a função está funcionando:

```bash
# Health check
curl -X GET https://your-project.supabase.co/functions/v1/order-extractor

# Teste de autenticação Gmail
curl -X GET https://your-project.supabase.co/functions/v1/order-extractor/auth/test

# Teste de extração de dados
curl -X POST https://your-project.supabase.co/functions/v1/order-extractor/test/extraction \
  -H "Content-Type: application/json" \
  -d '{
    "emailContent": "conteúdo do email aqui",
    "subject": "EVENTO 9314, ESTIMATIVA 29831, O.F. 60382, BANHEIRO QUIMICO PCD"
  }'

# Teste de cálculo MOLIDE
curl -X POST https://your-project.supabase.co/functions/v1/order-extractor/test/molide \
  -H "Content-Type: application/json" \
  -d '{
    "eventData": {
      "id": "9314",
      "year": 2025,
      "description": "Festa Junina",
      "startDate": "2025-06-21",
      "endDate": "2025-06-23",
      "startTime": "09:00",
      "endTime": "19:00",
      "location": "Praça Central",
      "contract": "12345",
      "items": [{"quantity": 2, "description": "BANHEIRO QUÍMICO PCD", "days": 3, "price": "150.00", "totalValue": 900}],
      "producers": [{"name": "João Silva", "phones": ["(11) 99999-9999"]}],
      "isCancelled": false
    }
  }'
```

## Estrutura Final do Banco

Após a instalação, você terá as seguintes tabelas:

### Tabelas Principais (do schema ideal)

- `new_emails` - Emails recebidos e dados extraídos
- `new_events` - Eventos principais
- `new_orders` - Ordens de fornecimento
- `new_order_items` - Itens das ordens
- `new_people` - Pessoas envolvidas
- `new_operations` - Operações MOLIDE
- `new_issues` - Problemas identificados

### Tabelas de Autenticação

- `user_gmail_credentials` - Credenciais OAuth2 dos usuários

## Verificação

Para verificar se tudo foi instalado corretamente:

1. **Verifique as tabelas** no Supabase Dashboard
2. **Teste os endpoints** da função
3. **Verifique os logs** da função
4. **Teste a autenticação** OAuth2

## Troubleshooting

### Erro: "relation does not exist"

- Certifique-se de que executou o `ideal-database-schema.sql` primeiro
- Verifique se todas as tabelas foram criadas

### Erro: "Gmail OAuth2 credentials not configured"

- Verifique se todas as variáveis de ambiente estão configuradas
- Verifique se as credenciais OAuth2 estão corretas

### Erro: "Failed to refresh token"

- Verifique se o refresh token é válido
- Verifique se a Gmail API está habilitada

## Próximos Passos

Após a instalação bem-sucedida:

1. **Teste todos os endpoints** de autenticação
2. **Implemente extração de emails** (Fase 2)
3. **Configure cron jobs** para execução automática
4. **Implemente monitoramento** e alertas

## Suporte

Se encontrar problemas durante a instalação:

1. Verifique os logs da função no Supabase Dashboard
2. Verifique se todas as variáveis de ambiente estão configuradas
3. Verifique se o schema ideal foi executado corretamente
4. Verifique se as credenciais OAuth2 estão válidas
