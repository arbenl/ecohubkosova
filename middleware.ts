// middleware.ts — minimal safe version for Edge

import { NextRequest, NextResponse } from "next/server"

const DEFAULT_LOCALE = "sq"
const LOCALES = ["sq", "en"]

// Extract locale from pathname or use default
function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean)
  if (segments[0] && LOCALES.includes(segments[0])) {
    return segments[0]
  }
  return DEFAULT_LOCALE
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Root path -> default locale home
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/sq/home", request.url))
  }

  const locale = getLocaleFromPath(pathname)

  // Set locale header for all requests so i18n config can access it
  const response = NextResponse.next()
  response.headers.set("x-locale", locale)
  return response
}

// Match root and all locale-prefixed routes
export const config = {
  matcher: ["/", "/(sq|en)/:path*"],
}

// Explicitly declare Edge Runtime to ensure no Node-only modules are bundled
export const runtime = "edge"
