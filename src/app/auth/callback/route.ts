import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
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

  const cookieStore = await cookies()

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

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
          (await cookies()).set(SESSION_VERSION_COOKIE, String(newVersion), SESSION_VERSION_COOKIE_OPTIONS)

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
