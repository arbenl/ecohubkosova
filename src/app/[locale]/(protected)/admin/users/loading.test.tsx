import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import Loading from "./loading"

describe("admin users loading", () => {
  it("renders nothing (skeleton handled elsewhere)", () => {
    const { container } = render(<Loading />)
    expect(container).toBeEmptyDOMElement()
  })
})
