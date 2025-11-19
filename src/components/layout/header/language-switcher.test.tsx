import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LanguageSwitcher } from "language-switcher"

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

// Mock external dependencies

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