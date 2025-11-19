import { describe, expect, it, vi } from "vitest"
import { getSessionInfo, incrementSessionVersion, validateSessionVersion } from "./session"

// Mock external dependencies
vi.mock("@/lib/drizzle", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(),
        })),
      })),
    })),
  },
}))

vi.mock("@/db/schema", () => ({
  userSessions: {},
}))

describe("session service", () => {
  it("should export getSessionInfo function", () => {
    expect(typeof getSessionInfo).toBe('function')
  })

  it("should export incrementSessionVersion function", () => {
    expect(typeof incrementSessionVersion).toBe('function')
  })

  it("should export validateSessionVersion function", () => {
    expect(typeof validateSessionVersion).toBe('function')
  })
})