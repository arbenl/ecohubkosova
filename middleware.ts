import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PROTECTED_PREFIXES = ["/admin", "/dashboard", "/profili", "/tregu/shto"]
const AUTH_PREFIXES = ["/auth/kycu", "/auth/regjistrohu"]
const IGNORED_PREFIXES = [
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/auth/callback",
  "/api/public",
  "/api/auth",
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname
  const isStaticAsset = /\.[a-zA-Z0-9]+$/.test(pathname)

  if (IGNORED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) || isStaticAsset) {
    return res
  }

  const supabase = createMiddlewareClient({ req, res })
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const hasSession = Boolean(session)

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const isAuthRoute = AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  // Always forward Set-Cookie headers so Supabase sessions persist across redirects.
  const redirectWithCookies = (url: URL) => NextResponse.redirect(url, { headers: res.headers })

  if (isProtected && !hasSession) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/auth/kycu"
    redirectUrl.searchParams.set("redirectedFrom", pathname)
    return redirectWithCookies(redirectUrl)
  }

  if (isAuthRoute && hasSession) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/dashboard"
    redirectUrl.searchParams.delete("redirectedFrom")
    return redirectWithCookies(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
}
