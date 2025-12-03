'use client'

export function LoginFooter() {
  return (
    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        Ao continuar, você concorda com nossos{' '}
        <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
          Termos de Serviço
        </a>{' '}
        e{' '}
        <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
          Política de Privacidade
        </a>
      </p>
    </div>
  )
}
