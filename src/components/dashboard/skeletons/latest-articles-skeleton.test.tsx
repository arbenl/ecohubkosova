import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LatestArticlesSkeleton } from "latest-articles-skeleton"

describe("LatestArticlesSkeleton component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <LatestArticlesSkeleton />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <LatestArticlesSkeleton />
    )
    expect(container).toBeInTheDocument()
  })
})