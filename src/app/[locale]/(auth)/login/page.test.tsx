import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import KycuPage from "./page"
import { NextIntlClientProvider } from "next-intl"
import { AuthProvider } from "@/lib/auth-provider"

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
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock external dependencies
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
  NextIntlClientProvider: ({ children, ...props }: any) => <div {...props}>{children}</div>
}))

vi.mock("@/hooks/use-supabase", () => ({
  useSupabase: () => ({
    supabase: {
      auth: {
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      }
    }
  })
}))

vi.mock("@/lib/supabase", () => ({
  createClientSupabaseClient: () => ({
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    }))
  })
}))

const messages = {
  "auth.login.title": "Login",
  "auth.login.email": "Email",
  "auth.login.password": "Password",
  "auth.login.submit": "Login",
}

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    <AuthProvider initialUser={null}>
      {children}
    </AuthProvider>
  </NextIntlClientProvider>
)

vi.mock("@/hooks/use-supabase", () => ({
  useSupabase: () => ({
    supabase: {
      auth: {
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      }
    }
  })
}))

describe("KycuPage component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <TestWrapper>
        <KycuPage />
      </TestWrapper>
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <TestWrapper>
        <KycuPage />
      </TestWrapper>
    )
    expect(container).toBeInTheDocument()
  })
})