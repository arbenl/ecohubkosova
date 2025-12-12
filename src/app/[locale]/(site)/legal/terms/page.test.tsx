import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import KushtetEPerdorimitPage from "./page"

describe("KushtetEPerdorimitPage", () => {
  it("renders the main heading and update date", () => {
    render(<KushtetEPerdorimitPage />)

    expect(screen.getByRole("heading", { name: /Kushtet e Përdorimit/i })).toBeInTheDocument()
    expect(screen.getByText(/Përditësuar më/)).toBeInTheDocument()
  })

  it("includes key sections for terms content", () => {
    render(<KushtetEPerdorimitPage />)

    expect(screen.getByText(/Pranimi i Kushteve/)).toBeInTheDocument()
    expect(screen.getByText(/Përdorimi i Pranueshëm/)).toBeInTheDocument()
  })
})
