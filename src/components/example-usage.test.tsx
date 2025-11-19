import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ExampleComponent } from "./example-usage"

// Mock external dependencies
vi.mock("@/lib/auth-provider", () => ({
  useAuth: () => ({
    user: { id: "test-user" },
    userProfile: null,
    isAdmin: false,
    isLoading: false,
    signOut: vi.fn()
  }),
  useSupabase: () => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [{ id: 1, name: "Test Item" }],
          error: null
        }))
      }))
    }))
  })
}))

describe("ExampleComponent component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <ExampleComponent />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <ExampleComponent />
    )
    expect(container).toBeInTheDocument()
  })
})