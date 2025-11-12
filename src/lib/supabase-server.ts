import { cache } from "react"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/supabase-js"

/**
 * Cached Supabase client for server components. Ensures a single instance per request.
 */
export const createServerSupabaseClient = cache(() => {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
})

/**
 * Fetches the authenticated user via Supabase Auth, ensuring data is verified
 * directly with the Auth service rather than trusting cookie contents.
 */
export const getServerUser = cache(async (): Promise<{
  user: User | null
  error: Error | null
}> => {
  const supabase = createServerSupabaseClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Failed to fetch server user:", error)
      return { user: null, error }
    }

    return { user, error: null }
  } catch (error) {
    console.error("Unexpected error fetching server user:", error)
    return { user: null, error: error as Error }
  }
})
