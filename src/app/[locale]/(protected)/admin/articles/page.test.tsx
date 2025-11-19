import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AdminArticlesPage } from "page"

describe("AdminArticlesPage component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <AdminArticlesPage />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <AdminArticlesPage />
    )
    expect(container).toBeInTheDocument()
  })
})