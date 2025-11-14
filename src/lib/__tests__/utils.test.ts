import { describe, expect, it } from "vitest"
import { cn } from "@/lib/utils"

describe("cn utility", () => {
  it("merges class names and removes duplicates", () => {
    const result = cn("p-4", "text-sm", "p-4", undefined, { "font-bold": true })
    expect(result.split(" ").sort()).toEqual(["p-4", "text-sm", "font-bold"].sort())
  })
})
