/**
 * Next.js instrumentation entry point.
 * Keep this file edge-safe; delegate Node-only work to a separate module.
 */
import * as Sentry from "@sentry/nextjs"

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Initialize Sentry for server-side
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
      debug: process.env.NODE_ENV === "development",
      // Set release for better tracking
      release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.npm_package_version,
    })
  }

  // Register Node-specific instrumentation
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerNodeInstrumentation } = await import("./instrumentation.node")
    await registerNodeInstrumentation()
  }
}
