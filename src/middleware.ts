import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ROUTES } from '@/shared/config'

export async function middleware(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const code = request.nextUrl.searchParams.get('code')
  if (code && pathname !== ROUTES.AUTH_CALLBACK && !pathname.startsWith('/api/contaazul/')) {
    const url = request.nextUrl.clone()
    url.pathname = ROUTES.AUTH_CALLBACK
    return NextResponse.redirect(url)
  }

  const protectedPaths = [
    ROUTES.DASHBOARD,
    ROUTES.EMPLOYEES,
    ROUTES.EVENTS,
    ROUTES.OPERATIONS,
    ROUTES.USERS,
    ROUTES.AUDIT,
    ROUTES.INTEGRATIONS_BASE,
  ]
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone()
    url.pathname = ROUTES.LOGIN
    return NextResponse.redirect(url)
  }

  if (user && pathname === ROUTES.LOGIN) {
    const url = request.nextUrl.clone()
    url.pathname = ROUTES.DASHBOARD
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/events')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace('/events', '/eventos')
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/employees')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace('/employees', '/funcionarios')
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/users')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace('/users', '/usuarios')
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
