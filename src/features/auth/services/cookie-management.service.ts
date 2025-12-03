import { NextResponse } from 'next/server'

export interface CookieOptions {
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  maxAge?: number
  path?: string
  domain?: string
}

export class CookieManagementService {
  setInviteTokenCookie(
    response: NextResponse,
    token: string,
    options: Partial<CookieOptions> = {},
  ): NextResponse {
    const defaultOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60,
      path: '/',
    }

    const finalOptions = { ...defaultOptions, ...options }

    response.cookies.set('invite_token', token, finalOptions)
    return response
  }

  createRedirectWithToken(
    redirectUrl: string,
    token: string,
    baseUrl: string,
    options?: Partial<CookieOptions>,
  ): NextResponse {
    const response = NextResponse.redirect(new URL(redirectUrl, baseUrl))
    return this.setInviteTokenCookie(response, token, options)
  }

  createErrorRedirect(errorUrl: string, baseUrl: string): NextResponse {
    return NextResponse.redirect(new URL(errorUrl, baseUrl))
  }

  getCookieOptions(isProduction: boolean = process.env.NODE_ENV === 'production'): CookieOptions {
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 60 * 60,
      path: '/',
    }
  }
}

export const cookieManagementService = new CookieManagementService()
