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
    const supabase = await createRouteHandlerSupabaseClient()

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
