import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { ensureUserProfileExists } from "@/lib/auth/profile-service"
import { logAuthAction } from "@/lib/auth/logging"

export const dynamic = "force-dynamic"

/**
 * GET /api/auth/profile
 * 
 * Returns the current user's profile.
 * 
 * Response (200 OK):
 * {
 *   profile: UserProfile | null,
 *   noProfile?: boolean,        // true if user has no profile yet (normal for new users)
 *   dbUnavailable?: boolean,    // true if profile query failed due to DB connectivity
 *   error?: string | null       // error message if applicable
 * }
 * 
 * Response (401 Unauthorized):
 * { profile: null, error: "Përdoruesi nuk është i kyçur." }
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

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
      // ensureUserProfileExists already handles connection/auth errors gracefully
      // It returns null for both "new user, no profile yet" and connection errors
      // Connection errors are logged by the service, not here
      const profile = await ensureUserProfileExists(supabase, user.id)

      if (profile) {
        logAuthAction("profileEndpoint", "Profile retrieved successfully", {
          userId: user.id,
        })
        return NextResponse.json({ profile, error: null })
      }

      // Profile is null - this is normal for new users
      // The profile-service logs connection errors separately if they occur
      logAuthAction("profileEndpoint", "No profile found (new user or DB unavailable)", {
        userId: user.id,
      })

      return NextResponse.json(
        {
          profile: null,
          noProfile: true, // Distinguish "no profile yet" from errors
          error: null,
        },
        { status: 200 }
      )
    } catch (err) {
      // Errors thrown here are from profile-service after connection error already logged
      const errorMsg = err instanceof Error ? err.message : String(err)

      logAuthAction("profileEndpoint", "Failed to fetch profile", {
        userId: user.id,
        error: errorMsg,
      })

      return NextResponse.json(
        {
          profile: null,
          noProfile: false,
          dbUnavailable: true, // Indicate DB problem
          error: "Gabim në lidhjen me bazën e të dhënave. Profili nuk u ngarkua.",
        },
        { status: 200 } // Return 200 to allow login flow to continue
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
