// middleware.ts - Enhanced with Supabase authentication
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const DEFAULT_LOCALE = 'sq'
const LOCALES = ['sq', 'en']
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/admin', '/settings', '/listings']
const AUTH_ROUTES = ['/login', '/register']

// Extract locale from pathname or use default
function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  if (segments[0] && LOCALES.includes(segments[0])) {
    return segments[0]
  }
  return DEFAULT_LOCALE
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl
  const locale = getLocaleFromPath(pathname)
  const pathWithoutLocale = pathname.startsWith(`/${locale}`)
    ? pathname.substring(`/${locale}`.length)
    : pathname

  // Root path -> default locale home
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/sq/home', request.url))
  }

  // If user is not logged in and tries to access a protected route, redirect to login
  if (!session && PROTECTED_ROUTES.some(route => pathWithoutLocale.startsWith(route))) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  // If user is logged in and tries to access an auth route, redirect to dashboard
  if (session && AUTH_ROUTES.some(route => pathWithoutLocale.startsWith(route))) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
  }

  // Set locale header for all requests so i18n config can access it
  response.headers.set('x-locale', locale)
  return response
}

// Match all requests except Next internals and static assets
export const config = {
  matcher: [
    // Match root
    '/',
    // Match all locale-prefixed routes
    '/(sq|en)/:path*',
    // Skip internal and static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ],
}

// Explicitly declare Edge Runtime to ensure no Node-only modules are bundled
export const runtime = 'edge'