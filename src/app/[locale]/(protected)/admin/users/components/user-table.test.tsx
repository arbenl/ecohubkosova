import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { UserTable } from "./user-table"

// Mock hooks
vi.mock("@/services/admin/users", () => ({
  users: vi.fn()
}))

describe("UserTable component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <UserTable />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <UserTable />
    )
    expect(container).toBeInTheDocument()
  })
})