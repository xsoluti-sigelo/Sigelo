import { NotFoundPage } from '@/shared/ui'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default function NotFound() {
  return (
    <NotFoundPage
      title="Página não encontrada"
      description="A página que você procura não existe."
    />
  )
}
