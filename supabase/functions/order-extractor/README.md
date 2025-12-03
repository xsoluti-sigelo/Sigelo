# Supabase Edge Function: `order-extractor`

## Visão Geral

A função `order-extractor` é uma Supabase Edge Function desenvolvida para processar e-mails de ordens de fornecimento, extrair informações relevantes usando regex patterns validados, calcular operações MOLIDE automaticamente e persistir esses dados em um banco de dados PostgreSQL.

Esta função implementa um sistema completo que vai desde a autenticação OAuth2 com a API do Gmail até o processamento completo de emails com geração automática de operações MOLIDE seguindo as regras documentadas.

## Arquitetura

```
supabase/functions/order-extractor/
├── index.ts                                    # Ponto de entrada principal da função
├── config/environment.ts                       # Configurações de ambiente e constantes
├── services/
│   ├── gmail-auth.service.ts                  # Autenticação OAuth2 com Gmail API
│   ├── email-extraction.service.ts            # Extração de dados usando regex patterns
│   ├── molide-calculator.service.ts           # Cálculo de operações MOLIDE
│   ├── database-persistence.service.ts        # Persistência no banco de dados
│   └── email-processing.service.ts            # Orquestração do processamento completo
├── handlers/
│   ├── auth.handler.ts                        # Handlers de autenticação
│   └── email-processing.handler.ts           # Handlers de processamento de emails
├── utils/logger.ts                            # Utilitário de logging estruturado
├── sql/create-tables.sql                      # Script SQL para tabelas de autenticação
├── README.md                                  # Este documento
└── INSTALL.md                                 # Instruções de instalação
```

### Componentes Principais:

1. **`index.ts`**:
   - Atua como o roteador principal da Edge Function.
   - Recebe requisições HTTP e as delega para os serviços apropriados.
   - Inicializa o cliente Supabase e todos os serviços.
   - Define todos os endpoints para autenticação e processamento.

2. **`services/gmail-auth.service.ts`**:
   - Contém a lógica de negócio para interagir com a API de autenticação do Google (OAuth2).
   - Responsável por gerar URLs de autorização, trocar códigos por tokens, renovar tokens e validar conectividade.

3. **`services/email-extraction.service.ts`**:
   - Implementa a extração de dados estruturados de emails usando regex patterns validados.
   - Extrai informações como eventos, datas, contratos, localizações, produtores, coordenadores, itens e valores.
   - Alcançou 100% de precisão nos testes com os patterns implementados.

4. **`services/molide-calculator.service.ts`**:
   - Implementa as regras MOLIDE consolidadas versão 2.1.
   - Suporta todos os tipos de eventos: contínuos, intermitentes e noturnos.
   - Calcula automaticamente operações de mobilização, limpeza e desmobilização.

5. **`services/database-persistence.service.ts`**:
   - Implementa a persistência de dados extraídos e operações MOLIDE no banco de dados.
   - Usa o schema ideal definido em `scripts/ideal-database-schema.sql`.
   - Detecta e persiste problemas de qualidade de dados automaticamente.

6. **`services/email-processing.service.ts`**:
   - Orquestra todo o fluxo de processamento de emails.
   - Coordena extração, cálculo MOLIDE e persistência.
   - Suporta processamento individual e em lote.

7. **`handlers/`**:
   - Contém os handlers HTTP para todos os endpoints.
   - Separação clara entre autenticação e processamento.
   - Validação de parâmetros e tratamento de erros.

8. **`utils/logger.ts`**:
   - Sistema de logging estruturado para monitoramento e depuração.
   - Logs formatados em JSON para ferramentas de agregação.

## Funcionalidades

### Autenticação OAuth2 (Fase 1)

- **`GET /order-extractor`**:
  - **Descrição**: Health check simples para verificar se a função está ativa.
  - **Método**: `GET`
  - **Resposta**: `{ status: "ok", message: "Order Extractor is running" }`

- **`GET /order-extractor/auth/test`**:
  - **Descrição**: Testa se as variáveis de ambiente para a autenticação Gmail estão configuradas corretamente.
  - **Método**: `GET`
  - **Resposta**: `{ success: true, isAuthenticated: boolean }`

- **`POST /order-extractor/auth/validate`**:
  - **Descrição**: Valida o status de autenticação de um usuário específico.
  - **Método**: `POST`
  - **Corpo da Requisição**: `{ userId: string }`
  - **Resposta**: `{ success: boolean, isAuthenticated: boolean, hasValidToken: boolean, tokenExpiresAt?: number, errors: string[] }`

- **`POST /order-extractor/auth/url`**:
  - **Descrição**: Gera o URL de autorização do Google para iniciar o fluxo OAuth2.
  - **Método**: `POST`
  - **Corpo da Requisição**: `{ redirectUri: string, state: string }`
  - **Resposta**: `{ success: true, authUrl: string }`

- **`POST /order-extractor/auth/exchange`**:
  - **Descrição**: Troca o código de autorização por tokens e salva no banco.
  - **Método**: `POST`
  - **Corpo da Requisição**: `{ code: string, redirectUri: string }`
  - **Resposta**: `{ success: true, message: "Tokens exchanged and saved" }`

- **`POST /order-extractor/auth/refresh`**:
  - **Descrição**: Renova o token de acesso usando o refresh token.
  - **Método**: `POST`
  - **Corpo da Requisição**: `{ userId: string }`
  - **Resposta**: `{ success: true, accessToken: string }`

- **`POST /order-extractor/auth/validate-connection`**:
  - **Descrição**: Valida a conectividade com a API do Gmail.
  - **Método**: `POST`
  - **Corpo da Requisição**: `{ userId: string }`
  - **Resposta**: `{ success: true, isValidConnection: boolean }`

### Processamento de Emails (Fase 2)

- **`POST /order-extractor/process/email`**:
  - **Descrição**: Processa um email individual completo: extração de dados, cálculo MOLIDE e persistência no banco.
  - **Método**: `POST`
  - **Corpo da Requisição**: `{ userId: string, emailId: string, subject: string, sender: string, receivedAt: string, rawContent: string }`
  - **Resposta**: `{ success: boolean, emailId?: string, eventId?: string, orderIds?: string[], operationIds?: string[], issueIds?: string[], extractedData?: object, molideResult?: object, persistenceResult?: object, errors?: string[], warnings?: string[], processingTime?: number }`

- **`POST /order-extractor/process/batch`**:
  - **Descrição**: Processa múltiplos emails em lote (máximo 50 por vez).
  - **Método**: `POST`
  - **Corpo da Requisição**: `{ userId: string, emails: Array<{ emailId: string, subject: string, sender: string, receivedAt: string, rawContent: string }> }`
  - **Resposta**: `{ success: boolean, batchStats: object, results: Array<EmailProcessingResult> }`

- **`POST /order-extractor/process/unprocessed`**:
  - **Descrição**: Processa emails não processados de um usuário (máximo 100 por vez).
  - **Método**: `POST`
  - **Corpo da Requisição**: `{ userId: string, limit?: number }`
  - **Resposta**: `{ success: boolean, unprocessedStats: object, results: Array<EmailProcessingResult> }`

- **`GET /order-extractor/process/stats`**:
  - **Descrição**: Obtém estatísticas de processamento de um usuário.
  - **Método**: `GET`
  - **Query Parameters**: `userId: string`
  - **Resposta**: `{ success: boolean, stats: { totalEmails: number, processedEmails: number, pendingEmails: number, errorEmails: number, totalEvents: number, totalOperations: number, totalIssues: number } }`

### Testes e Validação

- **`POST /order-extractor/test/extraction`**:
  - **Descrição**: Testa apenas a extração de dados de um email sem persistir no banco.
  - **Método**: `POST`
  - **Corpo da Requisição**: `{ emailContent: string, subject: string }`
  - **Resposta**: `{ success: boolean, extractedData: object }`

- **`POST /order-extractor/test/molide`**:
  - **Descrição**: Testa apenas o cálculo de operações MOLIDE sem persistir no banco.
  - **Método**: `POST`
  - **Corpo da Requisição**: `{ eventData: object }`
  - **Resposta**: `{ success: boolean, molideResult: object }`

## Banco de Dados

### Tabelas Principais

O banco de dados utiliza o **schema ideal** já definido em `scripts/ideal-database-schema.sql`:

- **new_emails** - Emails recebidos e dados extraídos
- **new_events** - Eventos principais
- **new_orders** - Ordens de fornecimento
- **new_order_items** - Itens das ordens
- **new_people** - Pessoas envolvidas
- **new_operations** - Operações MOLIDE
- **new_issues** - Problemas identificados

### Tabelas de Autenticação

Para a funcionalidade de autenticação OAuth2, foi criada uma tabela adicional:

- **user_gmail_credentials** - Credenciais OAuth2 dos usuários

### Schema Ideal

O banco de dados segue o schema ideal já definido em `scripts/ideal-database-schema.sql`, com tabelas prefixadas com `new_` para evitar conflitos com estruturas existentes.

## Regras MOLIDE Implementadas

A função implementa as **Regras MOLIDE Consolidadas versão 2.1** que cobrem todos os tipos de eventos:

### Tipos de Eventos Suportados

1. **Eventos Contínuos**: Equipamentos utilizados todos os dias consecutivamente
2. **Eventos Intermitentes**: Equipamentos instalados mas usados em dias específicos
3. **Eventos Noturnos**: Eventos que atravessam meia-noite
4. **Eventos Intermitentes Noturnos**: Combinação de intermitente e noturno

### Operações MOLIDE Geradas

- **Mobilização**: Instalação dos equipamentos (veículo CARGA)
- **Limpeza**: Higienização dos equipamentos (veículo TANQUE)
  - Pré-uso: Antes de reutilização após gaps
  - Pós-uso: Após cada período de uso
  - Diária: Para eventos contínuos
- **Desmobilização**: Retirada dos equipamentos (veículo CARGA)

### Detecção Automática

O sistema detecta automaticamente:

- Se o evento atravessa meia-noite (horário fim < horário início)
- Se o evento é intermitente (gaps entre dias de uso)
- Tipo de evento e aplica as regras apropriadas

## Segurança

- **Row Level Security (RLS)**: Implementado em todas as tabelas para garantir isolamento por usuário.
- **Variáveis de Ambiente**: Credenciais sensíveis gerenciadas via variáveis de ambiente do Supabase.
- **OAuth2**: Utiliza o fluxo padrão OAuth2 do Google para autorização segura.
- **Validação de Parâmetros**: Todos os endpoints validam parâmetros obrigatórios.
- **Limites de Processamento**: Limites configurados para processamento em lote.

## Logs e Monitoramento

O sistema de logs estruturado facilita o monitoramento:

- Logs formatados em JSON
- Diferentes níveis (DEBUG, INFO, WARN, ERROR)
- Contexto detalhado para cada operação
- Métricas de performance e tempo de processamento

## Próximos Passos

1. **Executar o schema ideal** - Execute `scripts/ideal-database-schema.sql` primeiro
2. **Executar tabelas de autenticação** - Execute `sql/create-tables.sql` para criar a tabela de credenciais
3. **Configurar variáveis de ambiente** no Supabase
4. **Testar os endpoints** de autenticação
5. **Implementar extração de emails** - Usar os regex patterns validados
6. **Implementar processamento de dados** - Converter emails em estruturas do banco
7. **Implementar operações MOLIDE** - Gerar operações baseadas nos dados extraídos
8. **Implementar cron jobs** - Execução automática da função
9. **Implementar monitoramento** - Alertas e métricas de performance

## Troubleshooting

### Erros Comuns

1. **"Gmail OAuth2 credentials not configured"**
   - Verifique se todas as variáveis de ambiente estão configuradas

2. **"Failed to refresh token"**
   - Verifique se o refresh token é válido
   - Verifique se as credenciais OAuth2 estão corretas

3. **"Failed to validate Gmail connection"**
   - Verifique se a Gmail API está habilitada
   - Verifique se os escopos estão corretos

4. **"Falha na extração de dados"**
   - Verifique se o formato do email está correto
   - Verifique se os regex patterns estão funcionando

5. **"Falha no cálculo MOLIDE"**
   - Verifique se os dados do evento estão completos
   - Verifique se as datas e horários estão no formato correto

### Logs

Para debugar problemas, verifique os logs da função no Supabase Dashboard ou use os endpoints de teste para validar cada componente individualmente.

## Contribuição

Para contribuir com este projeto:

1. Siga o padrão de arquitetura estabelecido
2. Use TypeScript com tipagem estrita
3. Implemente logs adequados
4. Teste todas as funcionalidades
5. Documente mudanças no README
6. Mantenha compatibilidade com o schema ideal existente
