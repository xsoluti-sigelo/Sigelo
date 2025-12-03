import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import './tiptap.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'
import { PageTransition } from '@/shared/ui'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
})

export const metadata: Metadata = {
  title: 'Sigelo - Sistema Inteligente de Gerenciamento de Locação',
  description: 'Sistema profissional de gerenciamento de locação de equipamentos',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${roboto.variable} antialiased`}>
        <Providers>
          <Suspense fallback={null}>
            <PageTransition />
          </Suspense>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  )
}
