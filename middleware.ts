import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { SESSION_VERSION_COOKIE, SESSION_VERSION_COOKIE_CLEAR_OPTIONS, SESSION_VERSION_COOKIE_OPTIONS } from "@/lib/auth/session-version"

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
  const cookieSessionVersion = req.cookies.get(SESSION_VERSION_COOKIE)?.value ?? null

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const isAdminRoute = ADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  let userRole: string | null = null
  let dbSessionVersion: number | null = null

  if (!hasSession && cookieSessionVersion) {
    res.cookies.set(SESSION_VERSION_COOKIE, "", SESSION_VERSION_COOKIE_CLEAR_OPTIONS)
  }

  if (sessionUserId) {
    const { data: userRow } = await supabase
      .from("users")
      .select("roli, session_version")
      .eq("id", sessionUserId)
      .single()

    userRole = userRow?.roli ?? null
    dbSessionVersion = userRow?.session_version ?? null

    if (dbSessionVersion !== null) {
      const dbVersionString = String(dbSessionVersion)
      if (cookieSessionVersion && cookieSessionVersion !== dbVersionString) {
        await supabase.auth.signOut()
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = "/auth/kycu"
        const response = redirectWithCookies(redirectUrl)
        response.cookies.set(SESSION_VERSION_COOKIE, "", SESSION_VERSION_COOKIE_CLEAR_OPTIONS)
        return response
      }

      if (!cookieSessionVersion || cookieSessionVersion !== dbVersionString) {
        res.cookies.set(SESSION_VERSION_COOKIE, dbVersionString, SESSION_VERSION_COOKIE_OPTIONS)
      }
    }
  }

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
    const isAdmin = userRole === "Admin"

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
