import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { UserEditModal } from "./user-edit-modal"

// Mock hooks
vi.mock("@/services/admin/users", () => ({
  users: vi.fn()
}))

// Mock external dependencies

describe("UserEditModal component", () => {
  const mockUser = {
    id: "1",
    full_name: "Test User",
    email: "test@example.com",
    location: "Test Location",
    role: "user",
    approved: true
  }

  const mockOnClose = vi.fn()
  const mockOnSubmit = vi.fn().mockResolvedValue({})

  it("renders without crashing", () => {
    expect(() => render(
      <UserEditModal user={mockUser} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <UserEditModal user={mockUser} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    )
    expect(container).toBeInTheDocument()
  })

  it("renders user data", () => {
    render(
      <UserEditModal user={mockUser} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    )
    expect(screen.getByDisplayValue("Test User")).toBeInTheDocument()
    expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument()
  })
})