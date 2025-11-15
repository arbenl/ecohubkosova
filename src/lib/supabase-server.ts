import { cache } from "react"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { User } from "@supabase/supabase-js"

/**
 * Cached Supabase client for server components. Ensures a single instance per request.
 */
export const createServerSupabaseClient = cache(async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware handling cookie setting.
          }
        },
      },
    }
  )
})

/**
 * Fetches the authenticated user via Supabase Auth, ensuring data is verified
 * directly with the Auth service rather than trusting cookie contents.
 */
export const getServerUser = cache(async (): Promise<{
  user: User | null
  error: Error | null
}> => {
  const supabase = await createServerSupabaseClient()

  const isSessionMissing = (err: unknown) =>
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as any).message === "string" &&
    (err as any).message.includes("Auth session missing")

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      if (!isSessionMissing(error)) {
        console.error("Failed to fetch server user:", error)
      }
      return { user: null, error }
    }

    return { user, error: null }
  } catch (error) {
    if (!isSessionMissing(error)) {
      console.error("Unexpected error fetching server user:", error)
    }
    return { user: null, error: error as Error }
  }
})
