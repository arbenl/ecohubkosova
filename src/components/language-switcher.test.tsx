import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LanguageSwitcher } from "./language-switcher"

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
  useLocale: () => "en",
  useTranslations: () => (key: string) => key
}))

// Mock locales
vi.mock("@/lib/locales", () => ({
  locales: ["en", "sq"]
}))

describe("LanguageSwitcher component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <LanguageSwitcher />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <LanguageSwitcher />
    )
    expect(container).toBeInTheDocument()
  })
})