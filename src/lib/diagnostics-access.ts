import { NextResponse } from "next/server"

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
} as const

export function isDiagnosticsRestricted() {
  if (process.env.DIAGNOSTICS_PUBLIC === "true") {
    return false
  }

  if (process.env.VERCEL_ENV) {
    return process.env.VERCEL_ENV === "production"
  }

  return process.env.NODE_ENV === "production"
}

export function hasDiagnosticsAccess(request: Request) {
  if (!isDiagnosticsRestricted()) {
    return true
  }

  const expectedKey = process.env.DIAGNOSTICS_API_KEY
  if (!expectedKey) {
    return false
  }

  const bearerToken = parseBearerToken(request.headers.get("authorization"))
  const headerToken = request.headers.get("x-diagnostics-key")

  return safeEqual(bearerToken, expectedKey) || safeEqual(headerToken, expectedKey)
}

export function diagnosticsNotFoundResponse() {
  return NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE_HEADERS })
}

export const diagnosticsNoStoreHeaders = NO_STORE_HEADERS

function parseBearerToken(value: string | null) {
  const match = value?.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() ?? null
}

function safeEqual(actual: string | null, expected: string) {
  if (!actual || actual.length !== expected.length) {
    return false
  }

  let diff = 0
  for (let index = 0; index < expected.length; index++) {
    diff |= actual.charCodeAt(index) ^ expected.charCodeAt(index)
  }

  return diff === 0
}
