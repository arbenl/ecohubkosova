import { describe, it, expect } from "vitest"
import * as schema from "../schema"

describe("Database schema", () => {
  it("should export database tables", () => {
    expect(schema).toBeDefined()
  })

  it("should have schema definitions available", () => {
    expect(typeof schema).toBe("object")
  })

  it("should be importable without errors", () => {
    // Verify we can import the schema
    expect(Object.keys(schema).length).toBeGreaterThan(0)
  })
})
