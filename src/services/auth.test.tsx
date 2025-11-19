import { describe, expect, it, vi } from "vitest"
import { validateAuthCredentials, handleSupabaseSignIn, handleSupabaseSignUp, setSessionCookie } from "./auth"

// Mock external dependencies
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
  })),
}))

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    set: vi.fn(),
  })),
}))

describe("auth service", () => {
  it("should export validateAuthCredentials function", () => {
    expect(typeof validateAuthCredentials).toBe('function')
  })

  it("should export handleSupabaseSignIn function", () => {
    expect(typeof handleSupabaseSignIn).toBe('function')
  })

  it("should export handleSupabaseSignUp function", () => {
    expect(typeof handleSupabaseSignUp).toBe('function')
  })

  it("should export setSessionCookie function", () => {
    expect(typeof setSessionCookie).toBe('function')
  })
})