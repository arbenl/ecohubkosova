import createMiddleware from "next-intl/middleware"
import type { NextRequest } from "next/server"
import { locales, defaultLocale } from "@/lib/i18n"

const intlMiddleware = createMiddleware({
  locales: locales as unknown as string[],
  defaultLocale,
  localePrefix: "always",
})

export function middleware(request: NextRequest) {
  // Get locale from URL or default
  const pathname = request.nextUrl.pathname

  // Check if pathname starts with a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // If no locale in URL, redirect to default locale
  if (!pathnameHasLocale) {
    const locale = defaultLocale
    return Response.redirect(
      new URL(`/${locale}${pathname === "/" ? "" : pathname}`, request.url)
    )
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
