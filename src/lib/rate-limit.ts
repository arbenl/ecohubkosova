/**
 * EcoHub Kosova – Rate Limiting Utility
 * MIT License – feel free to reuse in other projects.
 * Copyright (c) 2025 Kosovo Advocacy and Development Center (KADC)
 *
 * Simple in-memory rate limiter for protecting auth endpoints.
 * For production with multiple instances, consider Redis-based solutions.
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
 * const { success, remaining } = checkRateLimit(`login:${ip}`, 5, 60000)
 * if (!success) {
 *   return { error: "Too many attempts. Please try again later." }
 * }
 */
export function checkRateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  // No existing record or window has expired
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return {
      success: true,
      remaining: limit - 1,
      resetIn: windowMs,
    }
  }

  // Window still active, check if limit reached
  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetIn: record.resetTime - now,
    }
  }

  // Increment count
  record.count++
  return {
    success: true,
    remaining: limit - record.count,
    resetIn: record.resetTime - now,
  }
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
