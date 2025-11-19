import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { BaseLayout } from "./base-layout"

// Mock header and footer components
vi.mock("@/components/header", () => ({
  Header: () => <div data-testid="header">Header</div>
}))

vi.mock("@/components/footer", () => ({
  Footer: () => <div data-testid="footer">Footer</div>
}))

describe("BaseLayout component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <BaseLayout>
        <div>Test content</div>
      </BaseLayout>
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <BaseLayout>
        <div>Test content</div>
      </BaseLayout>
    )
    expect(container).toBeInTheDocument()
  })

  it("renders children", () => {
    render(
      <BaseLayout>
        <div>Test content</div>
      </BaseLayout>
    )
    expect(screen.getByText("Test content")).toBeInTheDocument()
  })
})