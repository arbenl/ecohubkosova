import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server"
import { ensureUserProfileExists } from "@/lib/auth/profile-service"

export async function GET() {
  const supabase = createRouteHandlerSupabaseClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ profile: null, error: "Përdoruesi nuk është i kyçur." }, { status: 401 })
  }

  try {
    const profile = await ensureUserProfileExists(supabase, user.id)
    return NextResponse.json({ profile })
  } catch (err) {
    console.error("Failed to ensure profile:", err)
    return NextResponse.json(
      { profile: null, error: err instanceof Error ? err.message : "Gabim gjatë ngarkimit të profilit." },
      { status: 500 }
    )
  }
}
