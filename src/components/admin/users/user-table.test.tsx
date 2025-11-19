import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { UserTable } from "./user-table"

// Mock hooks
vi.mock("@/services/admin/users", () => ({
  users: vi.fn()
}))

describe("UserTable component", () => {
  const mockUsers = [
    {
      id: "1",
      full_name: "Test User",
      email: "test@example.com",
      location: "Test Location",
      role: "user",
      approved: true
    }
  ]

  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()

  it("renders without crashing", () => {
    expect(() => render(
      <UserTable users={mockUsers} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <UserTable users={mockUsers} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    )
    expect(container).toBeInTheDocument()
  })

  it("renders user data", () => {
    render(
      <UserTable users={mockUsers} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    )
    expect(screen.getByText("Test User")).toBeInTheDocument()
    expect(screen.getByText("test@example.com")).toBeInTheDocument()
  })
})