export async function createServerSupabaseClient() {
  return {
    auth: {
      signInWithPassword: async () => ({ data: null, error: null }),
      signUp: async () => ({ data: null, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
      signInWithOAuth: async () => ({ data: null, error: null }),
    },
  }
}

// Deprecated aliases for backward compatibility
export const createServerActionSupabaseClient = createServerSupabaseClient
export const createRouteHandlerSupabaseClient = createServerSupabaseClient

export async function createCachedServerSupabaseClient() {
  return createServerSupabaseClient()
}

export async function getServerUser() {
  return { user: null, error: null }
}
