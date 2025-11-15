import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PROTECTED_PREFIXES = ["/admin", "/dashboard", "/profili", "/tregu/shto"]
const ADMIN_PREFIXES = ["/admin"]
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
  const ADMIN_REDIRECT_MESSAGE = "Nuk jeni i autorizuar të qaseni në këtë zonë."

  if (IGNORED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) || isStaticAsset) {
    return res
  }

  const supabase = createMiddlewareClient({ req, res })
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const hasSession = Boolean(session)
  const sessionUserId = session?.user?.id ?? null

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const isAdminRoute = ADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const isAuthRoute = AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  // Always forward Set-Cookie headers so Supabase sessions persist across redirects.
  const redirectWithCookies = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url)
    const setCookieHeaders = (res.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.() ?? []
    for (const cookie of setCookieHeaders) {
      redirectResponse.headers.append("set-cookie", cookie)
    }
    return redirectResponse
  }

  if (isProtected && !hasSession) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/auth/kycu"
    redirectUrl.searchParams.set("redirectedFrom", pathname)
    return redirectWithCookies(redirectUrl)
  }

  if (isAdminRoute && sessionUserId) {
    const { data: roleRow, error: roleError } = await supabase.from("users").select("roli").eq("id", sessionUserId).single()
    const isAdmin = !roleError && roleRow?.roli === "Admin"

    if (!isAdmin) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/auth/kycu"
      redirectUrl.searchParams.set("message", ADMIN_REDIRECT_MESSAGE)
      redirectUrl.searchParams.delete("redirectedFrom")
      return redirectWithCookies(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
}
