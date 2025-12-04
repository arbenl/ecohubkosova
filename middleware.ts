// middleware.ts - Enhanced with Supabase authentication and next-intl
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"
import createIntlMiddleware from "next-intl/middleware"
import { defaultLocale, deriveLocaleFromPath, locales } from "./src/lib/locale"

const PROTECTED_ROUTES = ["/dashboard", "/profile", "/admin", "/settings", "/listings", "/my"]
const AUTH_ROUTES = ["/login", "/register"]

// Create the next-intl middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: false,
})

export async function middleware(request: NextRequest) {
  try {
    // First, run the intl middleware to handle locale
    const intlResponse = intlMiddleware(request)

    // Get the pathname from the response URL (intl middleware may have modified it)
    const url = new URL(intlResponse?.url || request.url)
    const pathname = url.pathname

    // Extract locale from pathname (after intl middleware processing)
    const locale = deriveLocaleFromPath(pathname)
    const pathWithoutLocale = pathname.startsWith(`/${locale}`)
      ? pathname.replace(`/${locale}`, "")
      : pathname

    // Create response with intl's headers
    let response = intlResponse || NextResponse.next()

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
            request.cookies.set({ name, value: "", ...options })
            response.cookies.set({ name, value: "", ...options })
          },
        },
      }
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If user is not logged in and tries to access a protected route, redirect to login
    if (!session && PROTECTED_ROUTES.some((route) => pathWithoutLocale.startsWith(route))) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    }

    // If user is logged in and tries to access an auth route, redirect to workspace
    if (session && AUTH_ROUTES.some((route) => pathWithoutLocale.startsWith(route))) {
      return NextResponse.redirect(new URL(`/${locale}/my`, request.url))
    }

    return response
  } catch (error) {
    // Log and surface a minimal error response to help debug edge crashes
    console.error("[middleware:error]", error)
    return NextResponse.json(
      { error: "middleware_failed", message: String(error) },
      { status: 500 }
    )
  }
}

// Match all requests except Next internals and static assets
export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
}

// Explicitly declare Edge Runtime to ensure no Node-only modules are bundled
export const runtime = "edge"
