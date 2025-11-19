import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AuthProvider } from "./auth-provider"
import { NextIntlClientProvider } from "next-intl"

// Mock hooks
vi.mock("@/lib/auth/user-state-manager", () => ({
  UserStateManager: vi.fn().mockImplementation(function(this: any, setUser: any, setUserProfile: any, setIsLoading: any, setIsAdmin: any) {
    this.setUser = vi.fn()
    this.setUserProfile = vi.fn()
    this.setIsLoading = vi.fn()
    this.setIsAdmin = vi.fn()
    this.clearUser = vi.fn()
    this.reset = vi.fn()
  })
}))

// Mock Next.js
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn()
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams()
}))

// Mock next-intl
vi.mock("next-intl", () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useLocale: () => "en"
}))

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  createClientSupabaseClient: vi.fn(() => ({
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } }))
    }
  }))
}))

describe("AuthProvider component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <NextIntlClientProvider locale="en" messages={{}}>
        <AuthProvider />
      </NextIntlClientProvider>
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={{}}>
        <AuthProvider />
      </NextIntlClientProvider>
    )
    expect(container).toBeInTheDocument()
  })
})