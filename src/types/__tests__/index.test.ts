import { describe, it, expect } from "vitest"
import * as types from "../"

describe("Types module", () => {
  it("should export type definitions", () => {
    expect(typeof types).toBe("object")
  })

  it("should be importable without errors", () => {
    expect(types).toBeDefined()
  })
})
