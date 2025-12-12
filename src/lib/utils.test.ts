import { describe, expect, it } from "vitest"
import { cn } from "./utils"

describe("utils", () => {
  describe("cn", () => {
    it("merges class names correctly", () => {
      expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white")
    })

    it("handles conditional classes", () => {
      expect(cn("mb-4", true && "p-4", false && "hidden")).toBe("mb-4 p-4")
    })
    it("resolves tailwind conflicts correctly (tailwind-merge)", () => {
      // p-4 should override px-2 py-1
      expect(cn("px-2 py-1", "p-4")).toBe("p-4")
      // text-blue-500 should override text-red-500
      expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500")
    })

    it("handles non-string inputs", () => {
      expect(cn("text-red-500", null, undefined)).toBe("text-red-500")
    })
  })
})
