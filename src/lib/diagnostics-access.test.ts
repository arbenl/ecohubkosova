import { afterEach, describe, expect, it, vi } from "vitest"
import { hasDiagnosticsAccess, isDiagnosticsRestricted } from "./diagnostics-access"

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("diagnostics access", () => {
  it("allows access outside production", () => {
    vi.stubEnv("NODE_ENV", "development")
    vi.stubEnv("VERCEL_ENV", "preview")

    expect(isDiagnosticsRestricted()).toBe(false)
    expect(hasDiagnosticsAccess(new Request("https://example.com/api/docs"))).toBe(true)
  })

  it("hides diagnostics in production when no key is configured", () => {
    vi.stubEnv("VERCEL_ENV", "production")

    expect(isDiagnosticsRestricted()).toBe(true)
    expect(hasDiagnosticsAccess(new Request("https://example.com/api/docs"))).toBe(false)
  })

  it("allows diagnostics in production with a matching bearer token", () => {
    vi.stubEnv("VERCEL_ENV", "production")
    vi.stubEnv("DIAGNOSTICS_API_KEY", "secret-key")

    const request = new Request("https://example.com/api/docs", {
      headers: { Authorization: "Bearer secret-key" },
    })

    expect(hasDiagnosticsAccess(request)).toBe(true)
  })

  it("allows diagnostics in production with a matching diagnostics header", () => {
    vi.stubEnv("VERCEL_ENV", "production")
    vi.stubEnv("DIAGNOSTICS_API_KEY", "secret-key")

    const request = new Request("https://example.com/api/docs", {
      headers: { "x-diagnostics-key": "secret-key" },
    })

    expect(hasDiagnosticsAccess(request)).toBe(true)
  })

  it("rejects diagnostics in production with a wrong key", () => {
    vi.stubEnv("VERCEL_ENV", "production")
    vi.stubEnv("DIAGNOSTICS_API_KEY", "secret-key")

    const request = new Request("https://example.com/api/docs", {
      headers: { Authorization: "Bearer wrong-key" },
    })

    expect(hasDiagnosticsAccess(request)).toBe(false)
  })
})
