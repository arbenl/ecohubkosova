import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  validateAuthCredentials,
  handleSupabaseSignIn,
  handleSupabaseSignUp,
} from "@/services/auth"
import { loginSchema, registrationSchema } from "@/validation/auth"

// Mock Supabase client
vi.mock("@/lib/supabase/server", () => ({
  createServerActionSupabaseClient: vi.fn(),
}))

// Mock auth logging
vi.mock("@/lib/auth/logging", () => ({
  logAuthAction: vi.fn(),
}))

describe("Auth Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("validateAuthCredentials", () => {
    it("should validate correct email and password", async () => {
      const result = await validateAuthCredentials("test@example.com", "Password123!", loginSchema)

      expect(result.data).toBeDefined()
      expect(result.data?.email).toBe("test@example.com")
      expect(result.data?.password).toBe("Password123!")
      expect(result.error).toBeUndefined()
    })

    it("should reject invalid email", async () => {
      const result = await validateAuthCredentials("invalid-email", "Password123!", loginSchema)

      expect(result.error).toBeDefined()
      expect(result.data).toBeUndefined()
    })

    it("should reject invalid password (too short)", async () => {
      const result = await validateAuthCredentials("test@example.com", "123", loginSchema)

      expect(result.error).toBeDefined()
      expect(result.data).toBeUndefined()
    })

    it("should reject when both email and password are invalid", async () => {
      const result = await validateAuthCredentials("invalid", "123", loginSchema)

      expect(result.error).toBeDefined()
      expect(result.data).toBeUndefined()
    })
  })

  describe("handleSupabaseSignIn", () => {
    it("should return success on successful sign-in", async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValueOnce({
            data: {
              user: { id: "user-123" },
              session: { access_token: "token" },
            },
            error: null,
          }),
        },
      }

      vi.mocked(
        require("@/lib/supabase/server").createServerActionSupabaseClient
      ).mockResolvedValueOnce(mockSupabase)

      const result = await handleSupabaseSignIn("test@example.com", "Password123!")

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it("should return error on failed sign-in", async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValueOnce({
            data: null,
            error: { message: "Invalid login credentials" },
          }),
        },
      }

      vi.mocked(
        require("@/lib/supabase/server").createServerActionSupabaseClient
      ).mockResolvedValueOnce(mockSupabase)

      const result = await handleSupabaseSignIn("test@example.com", "wrongpassword")

      expect(result.error).toBeDefined()
      expect(result.success).toBeUndefined()
    })

    it("should return error when no session is created", async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValueOnce({
            data: { user: { id: "user-123" }, session: null },
            error: null,
          }),
        },
      }

      vi.mocked(
        require("@/lib/supabase/server").createServerActionSupabaseClient
      ).mockResolvedValueOnce(mockSupabase)

      const result = await handleSupabaseSignIn("test@example.com", "Password123!")

      expect(result.error).toBeDefined()
      expect(result.success).toBeUndefined()
    })
  })

  describe("handleSupabaseSignUp", () => {
    it("should return success on successful sign-up", async () => {
      const mockSupabase = {
        auth: {
          signUp: vi.fn().mockResolvedValueOnce({
            data: {
              user: { id: "user-123" },
              session: null,
            },
            error: null,
          }),
        },
      }

      vi.mocked(
        require("@/lib/supabase/server").createServerActionSupabaseClient
      ).mockResolvedValueOnce(mockSupabase)

      const result = await handleSupabaseSignUp("test@example.com", "Password123!", {
        name: "Test User",
      })

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it("should return specific error for existing user", async () => {
      const mockSupabase = {
        auth: {
          signUp: vi.fn().mockResolvedValueOnce({
            data: null,
            error: { message: "User already registered" },
          }),
        },
      }

      vi.mocked(
        require("@/lib/supabase/server").createServerActionSupabaseClient
      ).mockResolvedValueOnce(mockSupabase)

      const result = await handleSupabaseSignUp("existing@example.com", "Password123!", {
        name: "Test User",
      })

      expect(result.error).toBe("Ky email është i regjistruar më parë.")
    })

    it("should return error on failed sign-up", async () => {
      const mockSupabase = {
        auth: {
          signUp: vi.fn().mockResolvedValueOnce({
            data: null,
            error: { message: "Weak password" },
          }),
        },
      }

      vi.mocked(
        require("@/lib/supabase/server").createServerActionSupabaseClient
      ).mockResolvedValueOnce(mockSupabase)

      const result = await handleSupabaseSignUp("test@example.com", "weak", {
        name: "Test User",
      })

      expect(result.error).toBeDefined()
      expect(result.success).toBeUndefined()
    })

    it("should return error when no user is created", async () => {
      const mockSupabase = {
        auth: {
          signUp: vi.fn().mockResolvedValueOnce({
            data: { user: null },
            error: null,
          }),
        },
      }

      vi.mocked(
        require("@/lib/supabase/server").createServerActionSupabaseClient
      ).mockResolvedValueOnce(mockSupabase)

      const result = await handleSupabaseSignUp("test@example.com", "Password123!", {
        name: "Test User",
      })

      expect(result.error).toBeDefined()
      expect(result.success).toBeUndefined()
    })
  })
})
