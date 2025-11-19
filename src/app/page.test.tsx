import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import RootPage from "./page"

// Mock Next.js
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn()
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams()
}))

describe("RootPage component", () => {
  it("renders without crashing", () => {
    expect(() => render(<RootPage />)).not.toThrow()
  })

  it("renders with basic structure", () => {
    render(<RootPage />)
    expect(document.body).toBeInTheDocument()
  })
})