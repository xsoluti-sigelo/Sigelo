<div align="center">

# Sigelo

### Sistema Inteligente de Gerenciamento de Locação

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?style=for-the-badge&logo=vercel)](https://vercel.com/)

<p align="center">
  <strong>Plataforma completa para gerenciamento de locação de equipamentos e operações de eventos</strong>
</p>

[Funcionalidades](#-funcionalidades) •
[Tecnologias](#-stack-tecnológico) •
[Arquitetura](#-arquitetura) •
[Instalação](#-instalação) •
[Deploy](#-deploy)

</div>

---

## 📋 Sobre o Projeto

O **Sigelo** é um sistema web completo para gerenciamento de locação de equipamentos, desenvolvido com foco em operações de eventos. A plataforma oferece controle total sobre clientes, eventos, operações logísticas, frota de veículos, funcionários e integrações com sistemas externos.

### Principais Diferenciais

- **Extração Automática de Pedidos** via Gmail com Supabase Edge Functions
- **Integração Conta Azul** para sincronização contábil
- **Cálculos MOLIDE** automatizados para precificação
- **Multi-tenancy** com Row Level Security (RLS)
- **Audit Trail** completo de todas as operações

---

## ✨ Funcionalidades

### Gestão de Eventos
- Criação e gerenciamento completo de eventos
- Fluxo de status: `Recebido → Verificado → Agendado → Em Andamento → Concluído → Faturado`
- Visualização em calendário (mensal/semanal)
- Anexos e documentos por evento
- Histórico de alterações com audit trail

### Gestão de Pessoas
- Cadastro de Pessoas Físicas (PF) e Jurídicas (PJ)
- Múltiplos papéis: Cliente, Fornecedor, Parceiro, Coordenador, Produtor, Funcionário
- Gerenciamento de contatos (email, telefone, WhatsApp, redes sociais)
- Documentos e colaboradores vinculados

### Operações e Logística
- Gestão de pedidos e itens
- Atribuição de veículos e equipes
- Cálculos automáticos de precificação
- Acompanhamento de entregas e coletas

### Frota e Funcionários
- Cadastro de veículos (Caminhões Carga, Tanque, etc.)
- Gestão de status e disponibilidade
- Atribuição de motoristas e ajudantes
- Vínculo de funcionários com operações

### Integrações
- **Gmail** - Extração automática de pedidos via email
- **Conta Azul** - Sincronização de clientes e serviços
- **Google Maps** - Geocodificação de locais
- **ViaCEP** - Consulta de endereços por CEP

### Faturamento e Relatórios
- Geração de faturas a partir de eventos
- Exportação para PDF e Excel
- Dashboard financeiro
- Logs de geração de faturas

---

## 🛠 Stack Tecnológico

### Frontend
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Next.js** | 15.5.4 | Framework React com App Router e Server Components |
| **React** | 19.1.0 | Biblioteca de UI |
| **TypeScript** | 5.x | Tipagem estática |
| **Tailwind CSS** | 3.4.18 | Framework CSS utilitário |
| **React Hook Form** | 7.64.0 | Gerenciamento de formulários |
| **Zod** | 4.1.12 | Validação de schemas |

### UI Components
| Tecnologia | Descrição |
|------------|-----------|
| **Headless UI** | Componentes acessíveis sem estilo |
| **Lucide React** | Ícones SVG |
| **Tiptap** | Editor de texto rico |
| **React Big Calendar** | Visualização de calendário |
| **Sonner** | Notificações toast |

### Backend & Database
| Tecnologia | Descrição |
|------------|-----------|
| **Supabase** | Backend as a Service |
| **PostgreSQL** | Banco de dados relacional |
| **Supabase Auth** | Autenticação e autorização |
| **Supabase Edge Functions** | Funções serverless (Deno) |
| **Row Level Security** | Segurança a nível de linha |

### Documentos & Exportação
| Tecnologia | Descrição |
|------------|-----------|
| **@react-pdf/renderer** | Geração de PDFs |
| **pdf-lib** | Manipulação de PDFs |
| **xlsx** | Exportação para Excel |

### DevOps & Qualidade
| Tecnologia | Descrição |
|------------|-----------|
| **Vercel** | Plataforma de deploy |
| **Vitest** | Testes unitários |
| **Playwright** | Testes E2E |
| **ESLint + Prettier** | Linting e formatação |
| **Husky** | Git hooks |

---

## 🏗 Arquitetura

### Feature-Sliced Design (FSD)

O projeto segue a arquitetura **Feature-Sliced Design**, organizando o código por funcionalidades com camadas bem definidas:

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticação
│   ├── (dashboard)/       # Área logada
│   └── api/               # API Routes
│
├── entities/              # Modelos de domínio
│   ├── activity-log/
│   ├── audit-log/
│   ├── event/
│   ├── party/
│   └── ...
│
├── features/              # Módulos de funcionalidades
│   ├── auth/
│   │   ├── actions/       # Server Actions
│   │   ├── api/          # Queries e mutations
│   │   ├── components/   # Componentes React
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utilitários
│   │   ├── schemas/      # Validação Zod
│   │   └── types/        # Interfaces TypeScript
│   ├── events/
│   ├── operations/
│   ├── integrations/
│   └── ...
│
├── shared/                # Código compartilhado
│   ├── config/           # Configurações
│   ├── hooks/            # Hooks globais
│   ├── lib/              # Utilitários globais
│   └── ui/               # Componentes de UI
│
├── widgets/               # Componentes compostos
│
└── middleware.ts          # Middleware de autenticação
```

### Supabase Edge Functions

```
supabase/
├── functions/
│   └── order-extractor/   # Extração de pedidos via Gmail
│       ├── auth/          # Autenticação OAuth Gmail
│       ├── gmail/         # Operações Gmail API
│       ├── process/       # Processamento de emails
│       ├── services/      # Lógica de negócio
│       └── index.ts       # Router principal
│
└── migrations/            # Migrações do banco de dados
```

### Fluxo de Dados

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Cliente   │────▶│   Next.js   │────▶│  Supabase   │
│   (React)   │◀────│   Server    │◀────│  PostgreSQL │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    Edge     │
                    │  Functions  │
                    └─────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │  Gmail  │  │  Conta  │  │  Google │
        │   API   │  │  Azul   │  │   Maps  │
        └─────────┘  └─────────┘  └─────────┘
```

---

## 🚀 Instalação

### Pré-requisitos

- **Node.js** 18.x ou superior
- **npm** ou **pnpm**
- **Supabase CLI** (para desenvolvimento local)
- Conta no **Supabase** e **Vercel**

### Configuração Local

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/sigelo.git
cd sigelo
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

4. **Configure o Supabase local** (opcional)
```bash
npx supabase start
npx supabase db reset
```

5. **Execute o servidor de desenvolvimento**
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

---

## ⚙️ Variáveis de Ambiente

### Obrigatórias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# App
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
NODE_ENV=production
```

### Opcionais

```env
# Logging
LOG_LEVEL=info  # debug | info | warn | error | none

# Segurança
SECURE_COOKIES=true
ENABLE_METRICS=true

# Integração Conta Azul
CONTA_AZUL_CLIENT_ID=seu-client-id
CONTA_AZUL_CLIENT_SECRET=seu-client-secret
CONTA_AZUL_REDIRECT_URI=https://seu-dominio.com/api/contaazul/callback

# Google APIs (para Edge Function)
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
```

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento com Turbopack |
| `npm run build` | Gera o build de produção |
| `npm run start` | Inicia o servidor de produção |
| `npm run lint` | Executa o ESLint |
| `npm run format` | Formata o código com Prettier |
| `npm run test` | Executa os testes unitários |
| `npm run test:e2e` | Executa os testes E2E com Playwright |
| `npm run seed` | Popula o banco de dados com dados iniciais |
| `npm run backup` | Realiza backup do banco de dados |

---

## ☁️ Deploy

### Vercel (Frontend)

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente no painel do Vercel
3. O deploy será automático a cada push na branch `main`

```bash
# Deploy manual (opcional)
npx vercel --prod
```

### Supabase (Backend)

#### Database
```bash
# Aplica as migrações no projeto de produção
npx supabase db push --linked
```

#### Edge Functions
```bash
# Deploy da função order-extractor
npx supabase functions deploy order-extractor --project-ref seu-project-ref
```

### Arquitetura de Deploy

```
┌─────────────────────────────────────────────────────────┐
│                        Vercel                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Next.js Application                 │   │
│  │   • Server Components • API Routes • SSR        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                       Supabase                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │     Auth     │  │   Storage    │  │
│  │   Database   │  │   Service    │  │   (Files)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Edge Functions (Deno)                │  │
│  │         • order-extractor (Gmail API)            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Segurança

- **Row Level Security (RLS)** habilitado em todas as tabelas
- **Multi-tenancy** com isolamento por tenant
- **Autenticação OAuth 2.0** via Supabase Auth
- **Criptografia de credenciais** para integrações
- **Audit logs** completos de todas as operações
- **Cookies seguros** em produção

---

## 📊 Estrutura do Banco de Dados

### Principais Entidades

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários do sistema |
| `tenants` | Multi-tenancy |
| `parties` | Pessoas e organizações |
| `new_events` | Eventos |
| `new_orders` | Pedidos |
| `vehicles` | Frota de veículos |
| `audit_logs` | Logs de auditoria |
| `integrations` | Tokens OAuth de integrações |

### Views Úteis

| View | Descrição |
|------|-----------|
| `v_events_financial_summary` | Resumo financeiro de eventos |
| `v_latest_successful_invoices` | Últimas faturas geradas |
| `v_pending_payments` | Pagamentos pendentes |

---

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes com UI
npm run test:ui

# Testes E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 📁 Estrutura de Arquivos Importantes

```
├── src/
│   ├── app/
│   │   ├── (auth)/login/          # Página de login
│   │   ├── (dashboard)/           # Área logada
│   │   └── api/                   # API Routes
│   ├── features/
│   │   ├── auth/                  # Autenticação
│   │   ├── events/                # Gestão de eventos
│   │   ├── parties/               # Gestão de pessoas
│   │   ├── operations/            # Operações
│   │   ├── integrations/          # Integrações externas
│   │   └── user-management/       # Gestão de usuários
│   └── shared/
│       ├── config/env.ts          # Variáveis de ambiente
│       └── lib/supabase/          # Clientes Supabase
├── supabase/
│   ├── functions/order-extractor/ # Edge Function principal
│   └── migrations/                # Migrações SQL
├── types/
│   └── database.types.ts          # Tipos gerados do Supabase
└── package.json
```

---

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Padrões de Código

- Use **TypeScript** em todos os arquivos
- Siga o **ESLint** e **Prettier** configurados
- Commits seguem o padrão **Conventional Commits**
- Componentes React usam **function components** com hooks

---

## 📄 Licença

Este projeto é proprietário e confidencial. Todos os direitos reservados.

---

<div align="center">

[⬆ Voltar ao topo](#sigelo)

</div>
