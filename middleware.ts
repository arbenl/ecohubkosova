// Middleware handling authentication (i18n routing handled by [locale] layout)
import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/types/supabase"
import {
  SESSION_VERSION_COOKIE,
  SESSION_VERSION_COOKIE_CLEAR_OPTIONS,
  SESSION_VERSION_COOKIE_OPTIONS,
  AUTH_STATE_COOKIE,
  AUTH_STATE_COOKIE_OPTIONS,
} from "@/lib/auth/session-version"
import { logMiddlewareEvent } from "@/lib/auth/logging"

const PROTECTED_PREFIXES = ["/admin", "/dashboard", "/profile", "/marketplace/add"]
const ADMIN_PREFIXES = ["/admin"]
const AUTH_PREFIXES = ["/login", "/register", "/auth/login", "/auth/register"]
const IGNORED_PREFIXES = [
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/auth/callback",
  "/api/public",
  "/api/auth",
  "/api",
]

export async function middleware(req: NextRequest) {
  let pathname = req.nextUrl.pathname
  const isStaticAsset = /\.[a-zA-Z0-9]+$/.test(pathname)

  if (IGNORED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) || isStaticAsset) {
    return NextResponse.next()
  }

  // Extract locale and relative path
  const pathSegments = pathname.split("/").filter(Boolean)
  const locale = pathSegments[0]
  const relativePathname = "/" + pathSegments.slice(1).join("/")

  logMiddlewareEvent(pathname, "Middleware executed")

  try {
    // Create response first, then pass to middleware client
    const res = NextResponse.next()
    
    // Add Content Security Policy headers
    const isDevelopment = process.env.NODE_ENV === 'development'
    const cspValue = isDevelopment
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
      : "script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
    res.headers.set('Content-Security-Policy', cspValue)
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, options)
            )
          },
        },
      }
    )

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

    const isProtected = PROTECTED_PREFIXES.some((prefix) => relativePathname.startsWith(prefix))
    const isAdminRoute = ADMIN_PREFIXES.some((prefix) => relativePathname.startsWith(prefix))
    const isAuthRoute = AUTH_PREFIXES.some((prefix) => relativePathname.startsWith(prefix))

    // Clear stale session cookie if no session exists
    if (!hasSession && cookieSessionVersion) {
      logMiddlewareEvent(pathname, "Clearing stale session cookie")
      res.cookies.set(SESSION_VERSION_COOKIE, "", SESSION_VERSION_COOKIE_CLEAR_OPTIONS)
    }

    // Only query database if user is authenticated AND accessing ADMIN routes
    // For regular protected routes, trust Supabase session (no DB query needed)
    if (sessionUserId && isAdminRoute) {
      logMiddlewareEvent(pathname, "Validating admin access", { userId: sessionUserId })

      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", sessionUserId)
        .single()

      if (userError || !userRow) {
        logMiddlewareEvent(pathname, "Admin validation failed", {
          error: userError?.message ?? "User not found",
        })
        return NextResponse.redirect(new URL(`/${locale}/login?message=Unauthorized`, req.url))
      }

      const userRole = userRow.role
      logMiddlewareEvent(pathname, "Admin access check", { role: userRole })

      // Admin route access control
      if (!userRole?.includes("Admin")) {
        logMiddlewareEvent(pathname, "Unauthorized admin access", {
          userId: sessionUserId,
          role: userRole,
        })

        return NextResponse.redirect(new URL(`/${locale}/login?message=Unauthorized`, req.url))
      }
    }

    // Session version validation: ONLY if accessing protected routes
    // This detects concurrent logins (cookie exists and differs from DB)
    if (sessionUserId && isProtected && cookieSessionVersion) {
      logMiddlewareEvent(pathname, "Checking session version", {
        userId: sessionUserId,
        cookieVersion: cookieSessionVersion,
      })

      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select("session_version")
        .eq("id", sessionUserId)
        .single()

      if (userError || !userRow) {
        logMiddlewareEvent(pathname, "Session version check failed", {
          error: userError?.message ?? "User not found",
        })
        // Continue - let the route handle missing user
      } else {
        const dbVersionString = String(userRow.session_version)

        // IMPORTANT: Only force logout if cookie EXISTS and DIFFERS
        // (missing cookie is normal on first request, don't treat as threat)
        if (cookieSessionVersion !== dbVersionString) {
          logMiddlewareEvent(pathname, "Session version mismatch (possible concurrent login)", {
            cookieVersion: cookieSessionVersion,
            dbVersion: dbVersionString,
          })

          await supabase.auth.signOut({ scope: "global" })

          const redirectUrl = req.nextUrl.clone()
          redirectUrl.pathname = `/${locale}/login`
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
      }
    }

    // Sync session version cookie on first login (when cookie is missing)
    if (sessionUserId && !cookieSessionVersion) {
      logMiddlewareEvent(pathname, "Syncing session version cookie (first request)")

      const { data: userRow } = await supabase
        .from("users")
        .select("session_version")
        .eq("id", sessionUserId)
        .single()

      if (userRow) {
        const dbVersionString = String(userRow.session_version)
        res.cookies.set(SESSION_VERSION_COOKIE, dbVersionString, SESSION_VERSION_COOKIE_OPTIONS)
        res.cookies.set(AUTH_STATE_COOKIE, "authenticated", AUTH_STATE_COOKIE_OPTIONS)
      }
    }

    if (isProtected && !hasSession) {
      logMiddlewareEvent(pathname, "Protected route - no session")
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = `/${locale}/login`
      redirectUrl.searchParams.set("redirectedFrom", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    if (isAuthRoute && hasSession) {
      logMiddlewareEvent(pathname, "Redirecting authenticated user to dashboard")
      const dashboardUrl = new URL(`/${locale}/dashboard`, req.url)
      // Prevent infinite redirect loops by checking if we're already going to dashboard
      if (!pathname.includes("/dashboard")) {
        return NextResponse.redirect(dashboardUrl)
      }
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