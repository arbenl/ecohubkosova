import { getSupabaseBrowserClient } from "../supabase-browser"

// This function returns a singleton Supabase client for client-side operations.
export const createClientSupabaseClient = () => {
  return getSupabaseBrowserClient()
}
