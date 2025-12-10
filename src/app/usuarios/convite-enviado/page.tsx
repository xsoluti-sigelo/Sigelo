import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/shared/ui'
import { ROUTES } from '@/shared/config'

export default function InviteSentPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl w-full mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Illustration */}
          <div className="flex justify-center md:justify-end order-2 md:order-1">
            <div className="relative w-full max-w-lg">
              <Image
                src="/assets/images/undraw_mail-sent_ujev.svg"
                alt="Convite enviado"
                width={500}
                height={400}
                className="w-full h-auto drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          {/* Content */}
          <div className="text-center md:text-left order-1 md:order-2">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-gray-100 mb-3 leading-tight">
              Pronto,
              <br />
              <span className="text-blue-600 dark:text-blue-500">convite enviado!</span>
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              O usuário receberá um e-mail com o link para aceitar o convite e criar sua conta.
            </p>

            {/* Actions */}
            <div className="flex justify-center md:justify-start">
              <Link href={ROUTES.USERS}>
                <Button variant="outline" className="w-full sm:w-auto">
                  Voltar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
