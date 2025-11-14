import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Button } from "@/components/ui/button"

describe("Button component", () => {
  it("renders children", () => {
    render(<Button>Testo</Button>)
    expect(screen.getByRole("button", { name: "Testo" })).toBeInTheDocument()
  })

  it("supports outline variant styles", () => {
    const { getByRole } = render(<Button variant="outline">Outline</Button>)
    expect(getByRole("button", { name: "Outline" })).toHaveClass("border", { exact: false })
  })
})
