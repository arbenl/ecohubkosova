import "@testing-library/jest-dom/vitest"
import { vi } from "vitest"

// Mock Next.js modules that reference server-only imports
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
  revalidateTagsByPath: vi.fn(),
}))

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(() => []),
  })),
  headers: vi.fn(() => ({
    get: vi.fn(),
    getSetCookie: vi.fn(() => []),
  })),
}))

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`)
  }),
  notFound: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}))

// Mock the ACTUAL supabase-server file that contains the implementation
vi.mock("@/lib/supabase-server", () => {
  const mockSupabaseAuth = {
    getUser: vi.fn().mockResolvedValue({ data: null, error: null }),
    getSession: vi.fn().mockResolvedValue({ data: null, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: null, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: null }),
    signOut: vi.fn().mockResolvedValue({ data: null, error: null }),
  }

  const mockSupabaseFrom = vi.fn(() => ({
    select: vi.fn(function (this: any) {
      return this
    }),
    insert: vi.fn(function (this: any) {
      return this
    }),
    update: vi.fn(function (this: any) {
      return this
    }),
    delete: vi.fn(function (this: any) {
      return this
    }),
    eq: vi.fn(function (this: any) {
      return this
    }),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    execute: vi.fn().mockResolvedValue({ data: null, error: null }),
  }))

  const mockSupabaseClient = {
    auth: mockSupabaseAuth,
    from: mockSupabaseFrom,
  }

  return {
    createServerSupabaseClient: vi.fn(() => mockSupabaseClient),
    getServerUser: vi.fn().mockResolvedValue(null),
  }
})

// Mock the re-export path with same implementation
vi.mock("@/lib/supabase/server", async () => {
  // Return the same mocked implementation
  const mockSupabaseAuth = {
    getUser: vi.fn().mockResolvedValue({ data: null, error: null }),
    getSession: vi.fn().mockResolvedValue({ data: null, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: null, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: null }),
    signOut: vi.fn().mockResolvedValue({ data: null, error: null }),
  }

  const mockSupabaseFrom = vi.fn(() => ({
    select: vi.fn(function (this: any) {
      return this
    }),
    insert: vi.fn(function (this: any) {
      return this
    }),
    update: vi.fn(function (this: any) {
      return this
    }),
    delete: vi.fn(function (this: any) {
      return this
    }),
    eq: vi.fn(function (this: any) {
      return this
    }),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    execute: vi.fn().mockResolvedValue({ data: null, error: null }),
  }))

  const mockSupabaseClient = {
    auth: mockSupabaseAuth,
    from: mockSupabaseFrom,
  }

  return {
    createServerSupabaseClient: vi.fn(() => mockSupabaseClient),
    createRouteHandlerSupabaseClient: vi.fn(() => mockSupabaseClient),
    createServerActionSupabaseClient: vi.fn(() => mockSupabaseClient),
    getServerUser: vi.fn().mockResolvedValue(null),
  }
})

// Mock drizzle database that requires Node.js environment
vi.mock("@/lib/drizzle", () => {
  const mockQuery = {
    select: vi.fn(function (this: any) {
      return this
    }),
    from: vi.fn(function (this: any) {
      return this
    }),
    where: vi.fn(function (this: any) {
      return this
    }),
    limit: vi.fn(function (this: any) {
      return this
    }),
    offset: vi.fn(function (this: any) {
      return this
    }),
    orderBy: vi.fn(function (this: any) {
      return this
    }),
    execute: vi.fn().mockResolvedValue([]),
  }

  return {
    db: {
      get: vi.fn(() => mockQuery),
    },
  }
})

// Suppress Next.js warnings about server-only functions in test environment
const originalWarn = console.warn
const originalError = console.error

global.console.warn = (...args: any[]) => {
  const message = String(args[0])
  const suppressPatterns = [
    "useSearchParams",
    "useRouter",
    "usePathname",
    "Dynamic import",
    "server-only",
    "client-only",
    "CJS build of Vite",
    "deprecated",
  ]

  if (suppressPatterns.some((pattern) => message.includes(pattern))) {
    return
  }

  originalWarn(...args)
}

global.console.error = (...args: any[]) => {
  const message = String(args[0])
  const suppressPatterns = ["Cannot find module", "ENOENT", "404"]

  if (suppressPatterns.some((pattern) => message.includes(pattern))) {
    return
  }

  originalError(...args)
}
