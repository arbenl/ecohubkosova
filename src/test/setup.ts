import "@testing-library/jest-dom/vitest"
import { vi } from "vitest"

// Mock server-side Supabase imports that can't be loaded in jsdom environment
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  })),
  createRouteHandlerSupabaseClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(),
  })),
  createServerActionSupabaseClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
    },
    from: vi.fn(),
  })),
}))

// Mock drizzle database that requires Node.js environment
vi.mock("@/lib/drizzle", () => ({
  db: {
    get: vi.fn(() => ({
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    })),
  },
}))

// Suppress warnings about Next.js server functions in client environment
vi.stubGlobal("console", {
  ...console,
  warn: vi.fn((msg: string) => {
    // Only suppress expected warnings
    if (msg.includes("useSearchParams") || msg.includes("useRouter")) {
      return
    }
    console.warn(msg)
  }),
})
