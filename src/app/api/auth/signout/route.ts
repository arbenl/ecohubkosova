import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST() {
  const supabase = createRouteHandlerSupabaseClient()
  const { error } = await supabase.auth.signOut({ scope: "global" })

  const headers = new Headers({
    "Cache-Control": "no-store",
  })

  const response = NextResponse.json(
    error ? { success: false, error: error.message } : { success: true },
    {
      status: error ? 500 : 200,
      headers,
    }
  )

  response.cookies.set("__session", "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  })

  if (error) {
    response.cookies.set("logout_error", error.message, { path: "/", maxAge: 5 })
  } else {
    response.cookies.set("logout_error", "", { path: "/", maxAge: 0 })
  }

  return response
}
