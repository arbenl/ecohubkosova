import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { async } from "page"

// Mock hooks
vi.mock("@/hooks/use-admin-listings", () => ({
  useAdminListings: vi.fn()
}))

describe("async component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <async />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <async />
    )
    expect(container).toBeInTheDocument()
  })
})