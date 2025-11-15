// Alternative fix for middleware.ts - replace the middleware function with:
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  SESSION_VERSION_COOKIE,
  SESSION_VERSION_COOKIE_CLEAR_OPTIONS,
  SESSION_VERSION_COOKIE_OPTIONS,
  AUTH_STATE_COOKIE,
  AUTH_STATE_COOKIE_OPTIONS,
} from "@/lib/auth/session-version"
import { logMiddlewareEvent } from "@/lib/auth/logging"

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
  const pathname = req.nextUrl.pathname
  const isStaticAsset = /\.[a-zA-Z0-9]+$/.test(pathname)

  if (IGNORED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) || isStaticAsset) {
    return NextResponse.next()
  }

  logMiddlewareEvent(pathname, "Middleware executed")

  try {
    // Create response first, then pass to middleware client
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const hasSession = Boolean(session)
    const sessionUserId = session?.user?.id ?? null
    const cookieSessionVersion = req.cookies.get(SESSION_VERSION_COOKIE)?.value ?? null

    logMiddlewareEvent(pathname, "Session check", {
      hasSession,
      sessionUserId: sessionUserId ? `${sessionUserId.substring(0, 8)}...` : null,
      hasCookie: !!cookieSessionVersion,
    })

    const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    const isAdminRoute = ADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    const isAuthRoute = AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix))

    if (!hasSession && cookieSessionVersion) {
      logMiddlewareEvent(pathname, "Clearing stale session cookie")
      res.cookies.set(SESSION_VERSION_COOKIE, "", SESSION_VERSION_COOKIE_CLEAR_OPTIONS)
    }

    if (sessionUserId) {
      logMiddlewareEvent(pathname, "Validating session", { userId: sessionUserId })

      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select("roli, session_version")
        .eq("id", sessionUserId)
        .single()

      if (userError || !userRow) {
        logMiddlewareEvent(pathname, "Session validation failed", {
          error: userError?.message ?? "User not found",
        })
      } else {
        const userRole = userRow.roli
        const dbSessionVersion = userRow.session_version
        const dbVersionString = String(dbSessionVersion)

        logMiddlewareEvent(pathname, "Session validated", {
          dbVersion: dbVersionString,
          cookieVersion: cookieSessionVersion,
          role: userRole,
        })

        if (cookieSessionVersion && cookieSessionVersion !== dbVersionString) {
          logMiddlewareEvent(pathname, "Session version mismatch - logging out", {
            cookieVersion: cookieSessionVersion,
            dbVersion: dbVersionString,
          })

          await supabase.auth.signOut({ scope: "global" })

          const redirectUrl = req.nextUrl.clone()
          redirectUrl.pathname = "/auth/kycu"
          redirectUrl.searchParams.set("session_expired", "true")

          const redirectResponse = NextResponse.redirect(redirectUrl)
          redirectResponse.cookies.set(SESSION_VERSION_COOKIE, "", SESSION_VERSION_COOKIE_CLEAR_OPTIONS)
          redirectResponse.cookies.set("__session", "", {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 0,
          })

          return redirectResponse
        }

        if (!cookieSessionVersion || cookieSessionVersion !== dbVersionString) {
          logMiddlewareEvent(pathname, "Syncing session version cookie", {
            old: cookieSessionVersion,
            new: dbVersionString,
          })
          res.cookies.set(SESSION_VERSION_COOKIE, dbVersionString, SESSION_VERSION_COOKIE_OPTIONS)
          res.cookies.set(AUTH_STATE_COOKIE, "authenticated", AUTH_STATE_COOKIE_OPTIONS)
        }

        if (isAdminRoute && !userRole?.includes("Admin")) {
          logMiddlewareEvent(pathname, "Unauthorized admin access", {
            userId: sessionUserId,
            role: userRole,
          })

          return NextResponse.redirect(new URL("/auth/kycu?message=Unauthorized", req.url))
        }
      }
    }

    if (isProtected && !hasSession) {
      logMiddlewareEvent(pathname, "Protected route - no session")
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/auth/kycu"
      redirectUrl.searchParams.set("redirectedFrom", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    if (isAuthRoute && hasSession) {
      logMiddlewareEvent(pathname, "Redirecting authenticated user to dashboard")
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return res
  } catch (error) {
    logMiddlewareEvent(pathname, "Middleware error", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
}