import { renderHook, act } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useLocalizedRouter } from "./localized-navigation"

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
  useLocale: () => "en"
}))

// Mock locales
vi.mock("@/lib/locales", () => ({
  defaultLocale: "en"
}))

describe("useLocalizedRouter hook", () => {
  it("returns expected values", () => {
    const { result } = renderHook(() => useLocalizedRouter())
    expect(result.current).toBeDefined()
  })
})