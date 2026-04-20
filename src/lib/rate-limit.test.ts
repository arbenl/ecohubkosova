import { afterEach, describe, expect, it, vi } from "vitest"
import { checkRateLimit } from "./rate-limit"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe("checkRateLimit", () => {
  it("limits requests with the in-memory fallback", async () => {
    const key = `memory-${Date.now()}-${Math.random()}`

    await expect(checkRateLimit(key, 2, 60_000)).resolves.toMatchObject({
      success: true,
      remaining: 1,
      backend: "memory",
    })
    await expect(checkRateLimit(key, 2, 60_000)).resolves.toMatchObject({
      success: true,
      remaining: 0,
      backend: "memory",
    })
    await expect(checkRateLimit(key, 2, 60_000)).resolves.toMatchObject({
      success: false,
      remaining: 0,
      backend: "memory",
    })
  })

  it("uses Upstash Redis REST when configured", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io")
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token")

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ result: 1 }, { result: -1 }]), { status: 200 })
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ result: 1 }), { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    await expect(checkRateLimit("redis-key", 5, 60_000)).resolves.toMatchObject({
      success: true,
      remaining: 4,
      resetIn: 60_000,
      backend: "redis",
    })

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.upstash.io/pipeline",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer token" }),
      })
    )
  })

  it("falls back to memory if Redis is unavailable", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io")
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token")
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockRejectedValue(new Error("network down")))

    await expect(checkRateLimit(`fallback-${Date.now()}`, 5, 60_000)).resolves.toMatchObject({
      success: true,
      backend: "memory",
    })
  })
})
