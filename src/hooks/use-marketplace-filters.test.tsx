import { describe, expect, it, vi } from "vitest"
import { useMarketplaceFilters } from "./use-marketplace-filters"

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

// Mock React hooks
vi.mock("react", async () => {
  const actualReact = await vi.importActual("react")
  return {
    ...actualReact,
    useState: vi.fn(() => [{}, vi.fn()]),
    useTransition: vi.fn(() => [false, vi.fn()]),
    useCallback: vi.fn((fn) => fn),
    useMemo: vi.fn((fn) => fn()),
    useEffect: vi.fn(),
  }
})

describe("useMarketplaceFilters hook", () => {
  it("can be imported and is a function", () => {
    expect(typeof useMarketplaceFilters).toBe('function')
  })
})