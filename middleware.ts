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
    // TEMPORARY: Simplified middleware to debug the issue
    console.log("Middleware: Environment check", {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING",
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING",
      nodeEnv: process.env.NODE_ENV,
    })

    // Create response first, then pass to middleware client
    const res = NextResponse.next()

    // Add Content Security Policy headers
    const isDevelopment = process.env.NODE_ENV === 'development'
    const cspValue = isDevelopment
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
      : "script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
    res.headers.set('Content-Security-Policy', cspValue)

    // TEMPORARY: Skip Supabase client creation to isolate the issue
    console.log("Middleware: Skipping Supabase client creation for debugging")

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    logMiddlewareEvent(pathname, "Middleware error", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
}