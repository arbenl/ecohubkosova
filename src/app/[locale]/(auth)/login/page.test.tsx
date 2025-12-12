import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import KycuPage from "./page"
import { signIn } from "./actions"

// Mock translations and hooks
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}))

vi.mock("@/i18n/routing", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: () => null }),
}))

// Mock Supabase hook
vi.mock("@/lib/auth-provider", () => ({
  useSupabase: () => ({
    auth: { setSession: vi.fn() },
  }),
}))

// Mock Server Action
vi.mock("./actions", () => ({
  signIn: vi.fn(),
  signInWithGoogle: vi.fn(),
}))

describe("KycuPage", () => {
  it("renders login form", () => {
    render(<KycuPage />)
    expect(screen.getByTestId("login-email-input")).toBeInTheDocument()
    expect(screen.getByTestId("login-password-input")).toBeInTheDocument()
    expect(screen.getByTestId("login-submit-button")).toBeInTheDocument()
  })

  it("submits form with credentials", async () => {
    const mockSignIn = vi.mocked(signIn)
    mockSignIn.mockResolvedValue({ success: true })

    render(<KycuPage />)

    fireEvent.change(screen.getByTestId("login-email-input"), {
      target: { value: "test@example.com" },
    })
    fireEvent.change(screen.getByTestId("login-password-input"), { target: { value: "password" } })

    const submitBtn = screen.getByTestId("login-submit-button")
    expect(submitBtn).not.toBeDisabled()

    // Note: Form submission in jsdom might not trigger standard onSubmit if not wrapped in <form> properly
    // or if the button type="submit" isn't handled by fireEvent.click alone sometimes.
    // simpler to fire submit on the form if we can find it, or click button.

    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled()
    })
  })
})
