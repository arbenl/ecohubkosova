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
