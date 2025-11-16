export async function createServerActionSupabaseClient() {
  return {
    auth: {
      signInWithPassword: async () => ({ data: null, error: null }),
      signUp: async () => ({ data: null, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  }
}

export async function createServerSupabaseClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  }
}

export async function createRouteHandlerSupabaseClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  }
}

export async function getServerUser() {
  return { user: null }
}
