#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Creating new branch...${NC}"
git checkout -b claude_fixes

echo -e "${YELLOW}Creating logging utility...${NC}"
mkdir -p src/lib/auth
cat > src/lib/auth/logging.ts << 'EOF'
export const AUTH_DEBUG = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_AUTH_DEBUG === "true"

export function logAuthEvent(
  event: string,
  context: Record<string, any>,
  level: "info" | "warn" | "error" = "info"
) {
  if (!AUTH_DEBUG && level === "info") return

  const timestamp = new Date().toISOString()
  const prefix = `[AUTH ${timestamp}]`
  const data = JSON.stringify(context, null, 2)

  if (level === "error") {
    console.error(`${prefix} ❌ ${event}`, data)
  } else if (level === "warn") {
    console.warn(`${prefix} ⚠️  ${event}`, data)
  } else {
    console.log(`${prefix} ✓ ${event}`, data)
  }
}

export function logMiddlewareEvent(
  pathname: string,
  event: string,
  context?: Record<string, any>
) {
  logAuthEvent(`[MIDDLEWARE:${pathname}] ${event}`, context ?? {}, "info")
}

export function logAuthAction(
  action: string,
  event: string,
  context?: Record<string, any>
) {
  logAuthEvent(`[${action}] ${event}`, context ?? {}, "info")
}
EOF

echo -e "${GREEN}✓ Created logging utility${NC}"

echo -e "${YELLOW}Creating session service...${NC}"
mkdir -p src/services
cat > src/services/session.ts << 'EOF'
import { db } from "@/lib/drizzle"
import { users } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import { logAuthAction } from "@/lib/auth/logging"

interface SessionInfo {
  userId: string
  version: number
  role: string
  email: string
}

export async function getSessionInfo(userId: string): Promise<SessionInfo | null> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        session_version: true,
        roli: true,
        email: true,
      },
    })

    if (!user) {
      logAuthAction("getSessionInfo", "User not found", { userId })
      return null
    }

    logAuthAction("getSessionInfo", "Retrieved session info", {
      userId,
      version: user.session_version,
      role: user.roli,
    })

    return {
      userId: user.id,
      version: user.session_version,
      role: user.roli,
      email: user.email,
    }
  } catch (error) {
    logAuthAction("getSessionInfo", "Error retrieving session", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

export async function incrementSessionVersion(userId: string): Promise<number | null> {
  try {
    const [updated] = await db
      .update(users)
      .set({ session_version: sql`${users.session_version} + 1` })
      .where(eq(users.id, userId))
      .returning({ sessionVersion: users.session_version })

    const newVersion = updated?.sessionVersion ?? null

    logAuthAction("incrementSessionVersion", "Session version incremented", {
      userId,
      newVersion,
    })

    return newVersion
  } catch (error) {
    logAuthAction("incrementSessionVersion", "Error incrementing version", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

export async function validateSessionVersion(userId: string, clientVersion: string | null): Promise<boolean> {
  const sessionInfo = await getSessionInfo(userId)

  if (!sessionInfo) {
    logAuthAction("validateSessionVersion", "Session info not found", { userId })
    return false
  }

  const dbVersion = String(sessionInfo.version)
  const isValid = !clientVersion || clientVersion === dbVersion

  logAuthAction("validateSessionVersion", isValid ? "Valid" : "Invalid", {
    userId,
    clientVersion,
    dbVersion,
    isValid,
  })

  return isValid
}
EOF

echo -e "${GREEN}✓ Created session service${NC}"

echo -e "${YELLOW}Updating session-version.ts...${NC}"
cat > src/lib/auth/session-version.ts << 'EOF'
export const SESSION_VERSION_COOKIE = "eco_session_version"
export const AUTH_STATE_COOKIE = "eco_auth_state"

const baseCookieOptions = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
}

export const SESSION_VERSION_COOKIE_OPTIONS = {
  ...baseCookieOptions,
  maxAge: 60 * 60 * 24 * 30,
}

export const SESSION_VERSION_COOKIE_CLEAR_OPTIONS = {
  ...baseCookieOptions,
  maxAge: 0,
}

export const AUTH_STATE_COOKIE_OPTIONS = {
  ...baseCookieOptions,
  maxAge: 60 * 60 * 24 * 7,
}
EOF

echo -e "${GREEN}✓ Updated session-version.ts${NC}"

echo -e "${YELLOW}Updating middleware.ts...${NC}"
cat > middleware.ts << 'EOF'
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

  const res = NextResponse.next()

  try {
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
          redirectUrl.searchParams.delete("redirectedFrom")
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

        if (isAdminRoute) {
          const isAdmin = userRole === "Admin"

          if (!isAdmin) {
            logMiddlewareEvent(pathname, "Unauthorized admin access", {
              userId: sessionUserId,
              role: userRole,
            })

            const redirectUrl = req.nextUrl.clone()
            redirectUrl.pathname = "/auth/kycu"
            redirectUrl.searchParams.set("message", "Nuk jeni i autorizuar të qaseni në këtë zonë.")
            redirectUrl.searchParams.delete("redirectedFrom")

            const redirectResponse = NextResponse.redirect(redirectUrl)
            return redirectResponse
          }
        }
      }
    }

    if (isProtected && !hasSession) {
      logMiddlewareEvent(pathname, "Protected route - no session", {
        isProtected,
        hasSession,
      })

      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/auth/kycu"
      redirectUrl.searchParams.set("redirectedFrom", pathname)

      const redirectResponse = NextResponse.redirect(redirectUrl)
      return redirectResponse
    }

    if (isAuthRoute && hasSession) {
      logMiddlewareEvent(pathname, "Auth route - user already authenticated, redirecting", {
        targetPath: "/dashboard",
      })

      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/dashboard"
      redirectUrl.searchParams.delete("redirectedFrom")

      const redirectResponse = NextResponse.redirect(redirectUrl)
      return redirectResponse
    }

    logMiddlewareEvent(pathname, "Route allowed", {
      isProtected,
      isAdminRoute,
      isAuthRoute,
      hasSession,
    })

    return res
  } catch (error) {
    logMiddlewareEvent(pathname, "Middleware error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    return res
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
}
EOF

echo -e "${GREEN}✓ Updated middleware.ts${NC}"

echo -e "${YELLOW}Updating auth actions...${NC}"
cat > src/app/auth/kycu/actions.ts << 'EOF'
"use server"

import { redirect } from "next/navigation"
import { headers, cookies } from "next/headers"
import { createServerActionSupabaseClient } from "@/lib/supabase/server"
import { loginSchema } from "@/validation/auth"
import { incrementSessionVersion } from "@/services/session"
import { SESSION_VERSION_COOKIE, SESSION_VERSION_COOKIE_OPTIONS } from "@/lib/auth/session-version"
import { logAuthAction } from "@/lib/auth/logging"

export async function signIn(prevState: any, formData: FormData) {
  const email = formData.get("email")
  const password = formData.get("password")

  logAuthAction("signIn", "Login attempt", { email })

  const supabase = createServerActionSupabaseClient()

  const parsed = loginSchema.safeParse({
    email,
    password,
  })

  if (!parsed.success) {
    logAuthAction("signIn", "Validation failed", {
      email,
      errors: parsed.error.errors.map((e) => e.message),
    })
    return { message: parsed.error.errors[0]?.message ?? "Të dhëna të pavlefshme." }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    logAuthAction("signIn", "Authentication failed", {
      email,
      error: error.message,
    })
    return {
      message: error.message,
    }
  }

  const userId = data.user?.id

  if (!userId) {
    logAuthAction("signIn", "No user ID after successful auth", { email })
    return {
      message: "Përdoruesi nuk u gjet pas kyçjes.",
    }
  }

  const newVersion = await incrementSessionVersion(userId)

  if (newVersion === null) {
    logAuthAction("signIn", "Failed to increment session version", { userId })
    return {
      message: "Gabim gjatë përditësimit të sesionit.",
    }
  }

  const cookieStore = cookies()
  cookieStore.set(SESSION_VERSION_COOKIE, String(newVersion), SESSION_VERSION_COOKIE_OPTIONS)

  logAuthAction("signIn", "Login successful", {
    userId,
    email,
    sessionVersion: newVersion,
  })

  return redirect("/dashboard")
}

export async function signInWithGoogle() {
  logAuthAction("signInWithGoogle", "OAuth login initiated")

  const supabase = createServerActionSupabaseClient()
  const origin = headers().get("origin")

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    logAuthAction("signInWithGoogle", "OAuth initiation failed", {
      error: error.message,
    })
    return redirect(`/auth/kycu?message=${encodeURIComponent(error.message)}`)
  }

  return redirect(data.url)
}
EOF

echo -e "${GREEN}✓ Updated auth actions${NC}"

echo -e "${YELLOW}Updating auth callback...${NC}"
cat > src/app/auth/callback/route.ts << 'EOF'
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { incrementSessionVersion } from "@/services/session"
import { SESSION_VERSION_COOKIE, SESSION_VERSION_COOKIE_OPTIONS } from "@/lib/auth/session-version"
import { logAuthAction } from "@/lib/auth/logging"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const redirectTo =
    requestUrl.searchParams.get("redirectedFrom") ?? requestUrl.searchParams.get("next") ?? "/dashboard"

  logAuthAction("authCallback", "Callback triggered", {
    hasCode: !!code,
    redirectTo,
  })

  const cookieStore = cookies()

  if (code) {
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      await supabase.auth.exchangeCodeForSession(code)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user?.id) {
        logAuthAction("authCallback", "Code exchanged successfully", {
          userId: user.id,
          email: user.email,
        })

        const newVersion = await incrementSessionVersion(user.id)

        if (newVersion !== null) {
          cookieStore.set(SESSION_VERSION_COOKIE, String(newVersion), SESSION_VERSION_COOKIE_OPTIONS)

          logAuthAction("authCallback", "Session established", {
            userId: user.id,
            sessionVersion: newVersion,
          })
        } else {
          logAuthAction("authCallback", "Failed to increment session version", {
            userId: user.id,
          })
        }
      }
    } catch (error) {
      logAuthAction("authCallback", "Code exchange failed", {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
}
EOF

echo -e "${GREEN}✓ Updated auth callback${NC}"

echo -e "${YELLOW}Updating profile endpoint...${NC}"
cat > src/app/api/auth/profile/route.ts << 'EOF'
import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server"
import { ensureUserProfileExists } from "@/lib/auth/profile-service"
import { logAuthAction } from "@/lib/auth/logging"

export const dynamic = "force-dynamic"

const MAX_RETRIES = 3
const RETRY_DELAY = 100

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  delayMs: number = RETRY_DELAY
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)))
      }
    }
  }

  throw lastError
}

export async function GET() {
  try {
    const supabase = createRouteHandlerSupabaseClient()

    logAuthAction("profileEndpoint", "Profile request")

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      logAuthAction("profileEndpoint", "Auth check failed", {
        error: error.message,
      })
      return NextResponse.json(
        { profile: null, error: "Përdoruesi nuk është i kyçur." },
        { status: 401 }
      )
    }

    if (!user) {
      logAuthAction("profileEndpoint", "No user found")
      return NextResponse.json(
        { profile: null, error: "Përdoruesi nuk është i kyçur." },
        { status: 401 }
      )
    }

    try {
      const profile = await withRetry(
        () => ensureUserProfileExists(supabase, user.id),
        MAX_RETRIES,
        RETRY_DELAY
      )

      logAuthAction("profileEndpoint", "Profile retrieved successfully", {
        userId: user.id,
      })

      return NextResponse.json({ profile })
    } catch (err) {
      logAuthAction("profileEndpoint", "Failed to fetch profile after retries", {
        userId: user.id,
        error: err instanceof Error ? err.message : String(err),
      })

      return NextResponse.json(
        { profile: null, error: "Gabim gjatë ngarkimit të profilit." },
        { status: 500 }
      )
    }
  } catch (err) {
    logAuthAction("profileEndpoint", "Unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    })

    return NextResponse.json(
      { profile: null, error: "Gabim i brendshëm i serverit." },
      { status: 500 }
    )
  }
}
EOF

echo -e "${GREEN}✓ Updated profile endpoint${NC}"

echo -e "${YELLOW}Updating signout endpoint...${NC}"
cat > src/app/api/auth/signout/route.ts << 'EOF'
import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server"
import { SESSION_VERSION_COOKIE, SESSION_VERSION_COOKIE_CLEAR_OPTIONS } from "@/lib/auth/session-version"
import { logAuthAction } from "@/lib/auth/logging"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const supabase = createRouteHandlerSupabaseClient()

    logAuthAction("signoutEndpoint", "Sign-out request received")

    const { error } = await supabase.auth.signOut({ scope: "global" })

    if (error) {
      logAuthAction("signoutEndpoint", "Sign-out failed", {
        error: error.message,
      })
    } else {
      logAuthAction("signoutEndpoint", "User signed out successfully")
    }

    const response = NextResponse.json(
      error ? { success: false, error: error.message } : { success: true },
      {
        status: error ? 500 : 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    )

    response.cookies.set("__session", "", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
    })

    response.cookies.set(SESSION_VERSION_COOKIE, "", SESSION_VERSION_COOKIE_CLEAR_OPTIONS)

    if (error) {
      response.cookies.set("logout_error", error.message, {
        path: "/",
        maxAge: 5,
      })
    } else {
      response.cookies.set("logout_error", "", { path: "/", maxAge: 0 })
    }

    return response
  } catch (error) {
    logAuthAction("signoutEndpoint", "Unexpected error during sign-out", {
      error: error instanceof Error ? error.message : String(error),
    })

    const response = NextResponse.json(
      { success: false, error: "Gabim gjatë daljes." },
      { status: 500 }
    )

    response.cookies.set(SESSION_VERSION_COOKIE, "", SESSION_VERSION_COOKIE_CLEAR_OPTIONS)

    return response
  }
}
EOF

echo -e "${GREEN}✓ Updated signout endpoint${NC}"

echo -e "${YELLOW}Updating signout handler...${NC}"
cat > src/lib/auth/signout-handler.ts << 'EOF'
import type { MutableRefObject } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { logAuthAction } from "@/lib/auth/logging"

interface SignOutDeps {
  supabase: SupabaseClient<any, any, any>
  router: AppRouterInstance
  resetAuthState: () => void
  signOutInFlightRef: MutableRefObject<boolean>
  setSignOutPending: (value: boolean) => void
}

export function createSignOutHandler({
  supabase,
  router,
  resetAuthState,
  signOutInFlightRef,
  setSignOutPending,
}: SignOutDeps) {
  return async function signOut() {
    if (signOutInFlightRef.current) {
      logAuthAction("signOut", "Sign-out already in flight - ignoring request")
      return
    }

    signOutInFlightRef.current = true
    setSignOutPending(true)

    logAuthAction("signOut", "Sign-out initiated")

    try {
      resetAuthState()
      router.replace("/auth/kycu")
      router.refresh()

      try {
        await supabase.auth.signOut({ scope: "local" })
        logAuthAction("signOut", "Client-side sign-out successful")
      } catch (error) {
        logAuthAction("signOut", "Client-side sign-out error (non-fatal)", {
          error: error instanceof Error ? error.message : String(error),
        })
      }

      try {
        const response = await fetch("/api/auth/signout", {
          method: "POST",
          cache: "no-store",
          credentials: "include",
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.error ?? "Nuk u arrit dalja nga llogaria.")
        }

        logAuthAction("signOut", "Server-side sign-out successful")
      } catch (error) {
        logAuthAction("signOut", "Server-side sign-out error (non-fatal)", {
          error: error instanceof Error ? error.message : String(error),
        })
      }
    } finally {
      signOutInFlightRef.current = false
      setSignOutPending(false)
    }
  }
}
EOF

echo -e "${GREEN}✓ Updated signout handler${NC}"

echo -e "${YELLOW}Updating auth provider...${NC}"
cat > src/lib/auth-provider.tsx << 'EOFPROVIDER'
"use client"

import type React from "react"
import {
  useState,
  useEffect,
  useCallback,
  useContext,
  createContext,
  useMemo,
  useRef,
  useTransition,
} from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { User, AuthChangeEvent, AuthResponse, SignInWithPasswordCredentials } from "@supabase/supabase-js"
import { createClientSupabaseClient } from "@/lib/supabase"
import { createSignOutHandler } from "@/lib/auth/signout-handler"
import { logAuthAction } from "@/lib/auth/logging"
import type { UserProfile } from "@/types"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  isLoading: boolean
  signOutPending: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
  signInWithPassword: (credentials: SignInWithPasswordCredentials) => Promise<AuthResponse>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const SupabaseContext = createContext<ReturnType<typeof createClientSupabaseClient> | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
  initialUser: User | null
}

const PROFILE_FETCH_TIMEOUT = 5000
const MAX_PROFILE_RETRIES = 2

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser ?? null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [signOutPending, setSignOutPending] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClientSupabaseClient(), [])
  const signOutInFlightRef = useRef(false)
  const profileFetchAbortRef = useRef<AbortController | null>(null)
  const [, startTransition] = useTransition()

  const resetAuthState = useCallback(() => {
    setUser(null)
    setUserProfile(null)
    setIsAdmin(false)
    setIsLoading(false)
  }, [])

  const fetchUserProfile = useCallback(
    async (userId: string, attempt: number = 1): Promise<UserProfile | null> => {
      try {
        if (profileFetchAbortRef.current) {
          profileFetchAbortRef.current.abort()
        }

        const abortController = new AbortController()
        profileFetchAbortRef.current = abortController

        const timeout = setTimeout(() => abortController.abort(), PROFILE_FETCH_TIMEOUT)

        try {
          const response = await fetch("/api/auth/profile", {
            cache: "no-store",
            signal: abortController.signal,
          })

          clearTimeout(timeout)

          const payload = await response.json().catch(() => null)

          if (!response.ok) {
            if (attempt < MAX_PROFILE_RETRIES && response.status !== 401) {
              logAuthAction("fetchUserProfile", `Retry attempt ${attempt + 1}`, {
                userId,
                status: response.status,
              })

              await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
              return fetchUserProfile(userId, attempt + 1)
            }

            throw new Error(payload?.error || `HTTP ${response.status}`)
          }

          return (payload?.profile ?? null) as UserProfile | null
        } catch (fetchError) {
          if (fetchError instanceof Error && fetchError.name === "AbortError") {
            logAuthAction("fetchUserProfile", "Profile fetch timeout", { userId })
            return null
          }
          throw fetchError
        }
      } catch (error) {
        logAuthAction("fetchUserProfile", `Error on attempt ${attempt}`, {
          userId,
          error: error instanceof Error ? error.message : String(error),
        })
        return null
      }
    },
    []
  )

  const refreshUserProfile = useCallback(async () => {
    if (user) {
      logAuthAction("refreshUserProfile", "Refreshing profile", { userId: user.id })
      const profile = await fetchUserProfile(user.id)
      setUserProfile(profile)
      setIsAdmin(profile?.roli === "Admin")
    }
  }, [user, fetchUserProfile])

  const hydrateUser = useCallback(
    async (nextUser: User | null) => {
      if (!nextUser) {
        logAuthAction("hydrateUser", "Clearing user state (no user)")
        resetAuthState()
        return
      }

      logAuthAction("hydrateUser", "Hydrating user", { userId: nextUser.id })
      setUser(nextUser)

      try {
        const profile = await fetchUserProfile(nextUser.id)
        setUserProfile(profile)
        setIsAdmin(profile?.roli === "Admin")

        logAuthAction("hydrateUser", "User hydrated successfully", {
          userId: nextUser.id,
          hasProfile: !!profile,
        })
      } catch (error) {
        logAuthAction("hydrateUser", "Error hydrating user", {
          userId: nextUser.id,
          error: error instanceof Error ? error.message : String(error),
        })
        setUserProfile(null)
        setIsAdmin(false)
      }
    },
    [fetchUserProfile, resetAuthState]
  )

  const primeUser = useCallback(async () => {
    logAuthAction("primeUser", "Priming user on mount")
    setIsLoading(true)
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        throw error
      }

      await hydrateUser(user ?? null)
    } catch (error) {
      logAuthAction("primeUser", "Error during priming", {
        error: error instanceof Error ? error.message : String(error),
      })
      await hydrateUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [hydrateUser, supabase])

  useEffect(() => {
    let active = true

    primeUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      if (!active) return

      logAuthAction("onAuthStateChange", `Auth event: ${event}`, {
        hasSession: !!session,
      })

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          throw userError
        }

        await hydrateUser(user ?? null)
      } catch (error) {
        logAuthAction("onAuthStateChange", "Error handling auth change", {
          event,
          error: error instanceof Error ? error.message : String(error),
        })
        await hydrateUser(null)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
      if (profileFetchAbortRef.current) {
        profileFetchAbortRef.current.abort()
      }
    }
  }, [hydrateUser, supabase, primeUser])

  useEffect(() => {
    if (searchParams.get("session_expired") === "true") {
      logAuthAction("sessionExpired", "Session expired detected in URL params")
      startTransition(() => {
        resetAuthState()
      })
    }
  }, [searchParams, resetAuthState, startTransition])

  const signOut = useMemo(
    () =>
      createSignOutHandler({
        supabase,
        router,
        resetAuthState,
        signOutInFlightRef,
        setSignOutPending,
      }),
    [supabase, router, resetAuthState]
  )

  const signInWithPassword = async (credentials: SignInWithPasswordCredentials) => {
    try {
      const response = await supabase.auth.signInWithPassword(credentials)
      if (response.error) {
        throw response.error
      }
      return response
    } catch (error) {
      logAuthAction("signInWithPassword", "Error", {
        email: credentials.email,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    userProfile,
    isLoading,
    signOutPending,
    isAdmin,
    signOut,
    signInWithPassword,
    refreshUserProfile,
  }

  return (
    <SupabaseContext.Provider value={supabase}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </SupabaseContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error("useSupabase must be used within an AuthProvider")
  }
  return context
}
EOFPROVIDER

echo -e "${GREEN}✓ Updated auth provider${NC}"

echo -e "${YELLOW}Committing changes...${NC}"
git add -A
git commit -m "feat: comprehensive auth system refactor with logging and retry logic

- Add auth logging utility with debug mode
- Add session service for DB-backed session management
- Refactor middleware with proper response handling (no body consumption errors)
- Add session version cookie synchronization
- Update auth provider with retry logic and abort controllers
- Add retry logic to profile endpoint
- Enhanced sign-out with proper error handling
- Add AUTH_STATE_COOKIE for state tracking
- Comprehensive logging at all auth checkpoints
- Fix protected route navigation (tregu/shto issue)
- Proper session validation and synchronization"

echo -e "${GREEN}✓ All changes committed!${NC}"
echo -e "${YELLOW}Branch: $(git rev-parse --abbrev-ref HEAD)${NC}"
echo -e "${GREEN}✓ Setup complete!${NC}"