import { describe, expect, it } from "vitest"
import { createListing } from "./actions"

describe("marketplace/add actions", () => {
  it("exports createListing server action", () => {
    expect(createListing).toBeDefined()
    expect(typeof createListing).toBe("function")
  })
})
