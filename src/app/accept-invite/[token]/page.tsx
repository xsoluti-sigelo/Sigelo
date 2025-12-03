import { createClient } from '@/shared/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, Button } from '@/shared/ui'

interface AcceptInvitePageProps {
  params: Promise<{
    token: string
  }>
}

export default async function AcceptInvitePage({ params }: AcceptInvitePageProps) {
  const { token } = await params

  const { createAdminClient } = await import('@/shared/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { data: invite, error } = await adminClient
    .from('user_invites')
    .select('id, email, full_name, role, expires_at, tenant_id, status')
    .eq('invite_token', token)
    .single()

  if (error || !invite) {
    return <InvalidInvite message="Convite inválido ou não encontrado" />
  }

  const expiresAt = new Date(invite.expires_at)
  if (expiresAt < new Date()) {
    return <InvalidInvite message="Este convite expirou" />
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user && user.email === invite.email) {
    redirect('/api/auth/finalize-invite?token=' + encodeURIComponent(token))
  }
  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrador',
    OPERATOR: 'Operador',
    VIEWER: 'Visualizador',
  }

  const roleDescriptions: Record<string, string> = {
    ADMIN: 'Acesso completo ao sistema',
    OPERATOR: 'Criar e editar operações',
    VIEWER: 'Visualizar dados do sistema',
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <Card className="max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-teal-100 dark:bg-teal-900/30 mb-4">
            <svg
              className="h-8 w-8 text-teal-600 dark:text-teal-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Bem-vindo ao Sigelo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Você foi convidado para acessar o sistema
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Detalhes do Convite
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Nome</label>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {invite.full_name}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">E-mail</label>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {invite.email}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Papel no Sistema</label>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {roleLabels[invite.role]} - {roleDescriptions[invite.role]}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Válido até</label>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {expiresAt.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Como aceitar o convite?
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>Clique no botão abaixo para fazer login com sua conta Google</li>
            <li>
              Use o e-mail <strong>{invite.email}</strong> para fazer login
            </li>
            <li>Após o login, você terá acesso ao sistema automaticamente</li>
          </ul>
        </div>

        <form action="/api/auth/accept-invite" method="GET">
          <input type="hidden" name="token" value={token} />
          <Button type="submit" size="lg" className="w-full gap-3">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Aceitar Convite e Entrar com Google
          </Button>
        </form>
      </Card>
    </div>
  )
}

function InvalidInvite({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Convite Inválido
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>

          <a
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
          >
            Ir para Login
          </a>
        </div>
      </Card>
    </div>
  )
}
