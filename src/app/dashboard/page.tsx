import { Breadcrumb } from '@/shared/ui'
import { getUser } from '@/features/auth'
import { DashboardStats, dashboardStatsService } from '@/features/dashboard'
import { logger } from '@/shared/lib/logger'

export const metadata = {
  title: 'Dashboard | Sigelo',
  description: 'Acompanhe os principais indicadores operacionais em um só lugar.',
}

export default async function DashboardPage() {
  const user = await getUser()

  try {
    const stats = await dashboardStatsService.getDashboardStats()
    const cards = dashboardStatsService.getDashboardCards(stats)

    return (
      <div className="p-8 w-full">
        <div className="max-w-[1600px] mx-auto">
          <Breadcrumb items={[{ label: 'Dashboard' }]} className="mb-6" />

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Acompanhe os indicadores operacionais e de integração em um só lugar.
            </p>
          </div>

          <DashboardStats cards={cards} />
        </div>
      </div>
    )
  } catch (error) {
    logger.error('User data not found', error instanceof Error ? error : new Error(String(error)), {
      userId: user?.id,
    })

    return (
      <div className="p-8 w-full">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-800">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 mb-4">
            <svg
              className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Configuração Necessária
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Seu usuário ainda não está completamente configurado. Entre em contato com um
            administrador.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Email: {user?.email ?? 'indisponível'}
          </p>
          <form
            action={async () => {
              'use server'
              const { signOut } = await import('@/features/auth')
              await signOut()
            }}
          >
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    )
  }
}
