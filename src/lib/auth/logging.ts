export const AUTH_DEBUG = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_AUTH_DEBUG === "true"

export function logAuthEvent(
  event: string,
  context: Record<string, any>,
  level: "info" | "warn" | "error" = "info"
) {
  if (!AUTH_DEBUG && level === "info") return

  const timestamp = new Date().toISOString()
  const prefix = `[AUTH ${timestamp}]`
  const data = JSON.stringify(context, null, 2)

  if (level === "error") {
    console.error(`${prefix} ❌ ${event}`, data)
  } else if (level === "warn") {
    console.warn(`${prefix} ⚠️  ${event}`, data)
  } else {
    console.log(`${prefix} ✓ ${event}`, data)
  }
}

export function logMiddlewareEvent(
  pathname: string,
  event: string,
  context?: Record<string, any>
) {
  logAuthEvent(`[MIDDLEWARE:${pathname}] ${event}`, context ?? {}, "info")
}

export function logAuthAction(
  action: string,
  event: string,
  context?: Record<string, any>
) {
  logAuthEvent(`[${action}] ${event}`, context ?? {}, "info")
}
