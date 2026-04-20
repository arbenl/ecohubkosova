/**
 * EcoHub Kosova – Rate Limiting Utility
 * MIT License – feel free to reuse in other projects.
 * Copyright (c) 2025 Kosovo Advocacy and Development Center (KADC)
 *
 * Rate limiter for protecting auth and write-adjacent endpoints.
 * Uses Upstash Redis REST when configured and falls back to in-memory storage.
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitRecord>()

// Cleanup old entries periodically (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now()
      for (const [key, record] of rateLimitStore.entries()) {
        if (now > record.resetTime) {
          rateLimitStore.delete(key)
        }
      }
    },
    5 * 60 * 1000
  )
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetIn: number // milliseconds until reset
  backend: "memory" | "redis"
}

/**
 * Check if a request is within rate limits.
 *
 * @param key - Unique identifier for the rate limit (e.g., "login:192.168.1.1")
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @returns Object with success status, remaining attempts, and reset time
 *
 * @example
 * const { success, remaining } = await checkRateLimit(`login:${ip}`, 5, 60000)
 * if (!success) {
 *   return { error: "Too many attempts. Please try again later." }
 * }
 */
export async function checkRateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  const redisResult = await checkRedisRateLimit(key, limit, windowMs)
  if (redisResult) return redisResult

  return checkMemoryRateLimit(key, limit, windowMs)
}

function checkMemoryRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  // No existing record or window has expired
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return {
      success: true,
      remaining: limit - 1,
      resetIn: windowMs,
      backend: "memory",
    }
  }

  // Window still active, check if limit reached
  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetIn: record.resetTime - now,
      backend: "memory",
    }
  }

  // Increment count
  record.count++
  return {
    success: true,
    remaining: limit - record.count,
    resetIn: record.resetTime - now,
    backend: "memory",
  }
}

type UpstashResponse = {
  result?: unknown
  error?: string
}

async function checkRedisRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult | null> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!redisUrl || !redisToken) {
    return null
  }

  const redisKey = `ecohub:rate:${key}`

  try {
    const [countResponse, ttlResponse] = await runUpstashPipeline(redisUrl, redisToken, [
      ["INCR", redisKey],
      ["PTTL", redisKey],
    ])

    const count = Number(countResponse?.result)
    let ttl = Number(ttlResponse?.result)

    if (!Number.isFinite(count)) {
      return null
    }

    if (!Number.isFinite(ttl) || ttl < 0) {
      const expireResponse = await runUpstashCommand(redisUrl, redisToken, [
        "PEXPIRE",
        redisKey,
        windowMs,
      ])
      if (expireResponse?.error) {
        return null
      }
      ttl = windowMs
    }

    return {
      success: count <= limit,
      remaining: Math.max(limit - count, 0),
      resetIn: Math.max(ttl, 0),
      backend: "redis",
    }
  } catch (error) {
    console.error("[rate-limit] Redis rate limit failed, falling back to memory:", error)
    return null
  }
}

async function runUpstashPipeline(
  redisUrl: string,
  redisToken: string,
  commands: Array<Array<string | number>>
): Promise<UpstashResponse[]> {
  const response = await fetch(`${redisUrl.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${redisToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  })

  if (!response.ok) {
    throw new Error(`Upstash pipeline failed with status ${response.status}`)
  }

  const payload = (await response.json()) as UpstashResponse[]
  if (!Array.isArray(payload) || payload.some((item) => item?.error)) {
    throw new Error("Upstash pipeline returned an error")
  }

  return payload
}

async function runUpstashCommand(
  redisUrl: string,
  redisToken: string,
  command: Array<string | number>
): Promise<UpstashResponse> {
  const response = await fetch(redisUrl.replace(/\/$/, ""), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${redisToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  })

  if (!response.ok) {
    throw new Error(`Upstash command failed with status ${response.status}`)
  }

  return (await response.json()) as UpstashResponse
}

/**
 * Reset rate limit for a specific key.
 * Useful after successful authentication to clear failed attempts.
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key)
}

/**
 * Get client IP address from request headers.
 * Works with Vercel, Cloudflare, and standard proxies.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("cf-connecting-ip") ||
    "unknown"
  )
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // Auth endpoints - stricter limits
  LOGIN: { limit: 5, windowMs: 60 * 1000 }, // 5 per minute
  REGISTER: { limit: 3, windowMs: 60 * 1000 }, // 3 per minute
  PASSWORD_RESET: { limit: 3, windowMs: 5 * 60 * 1000 }, // 3 per 5 minutes

  // API endpoints - more lenient
  API_DEFAULT: { limit: 100, windowMs: 60 * 1000 }, // 100 per minute
  API_SEARCH: { limit: 30, windowMs: 60 * 1000 }, // 30 per minute

  // Contact forms
  CONTACT_FORM: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
} as const
