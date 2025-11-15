// Create new file: src/app/api/auth/home-redirect/route.ts
import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server"
import { SESSION_VERSION_COOKIE, SESSION_VERSION_COOKIE_CLEAR_OPTIONS } from "@/lib/auth/session-version"
import { logAuthAction } from "@/lib/auth/logging"

export const dynamic = "force-dynamic"

export async function GET() {
  if (process.env.NEXT_PUBLIC_FORCE_DEV_SIGNOUT === "true") {
    try {
      const supabase = createRouteHandlerSupabaseClient()
      await supabase.auth.signOut({ scope: "global" })
      
      logAuthAction("homeRedirect", "Auto sign-out on home redirect")

      const response = NextResponse.redirect(new URL("/auth/kycu", process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000"))
      response.cookies.set(SESSION_VERSION_COOKIE, "", SESSION_VERSION_COOKIE_CLEAR_OPTIONS)
      response.cookies.set("__session", "", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
      })

      return response
    } catch (error) {
      logAuthAction("homeRedirect", "Error during auto sign-out", {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return NextResponse.redirect(new URL("/auth/kycu", process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000"))
}