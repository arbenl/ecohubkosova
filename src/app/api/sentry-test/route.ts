import { NextResponse } from "next/server"
import * as Sentry from "@sentry/nextjs"

export async function GET() {
  // Only allow this route in non-production environments
  if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 })
  }

  console.log("\n========================================")
  console.log("[Sentry Test API] Starting test...")
  console.log("========================================")

  // Log DSN status
  const hasDsn = !!process.env.SENTRY_DSN
  const dsnPreview = process.env.SENTRY_DSN?.substring(0, 30) + "..."

  console.log("[Sentry Test API] DSN configured:", hasDsn)
  console.log("[Sentry Test API] DSN preview:", dsnPreview)
  console.log("[Sentry Test API] Environment:", process.env.NODE_ENV)
  console.log("[Sentry Test API] VERCEL_ENV:", process.env.VERCEL_ENV || "not set")
  console.log("[Sentry Test API] Sentry initialized:", Sentry.isInitialized())

  try {
    // Create the error
    const error = new Error("Sentry Server Smoke Test Error")
    error.stack = `Error: Sentry Server Smoke Test Error
    at GET (/api/sentry-test/route.ts:25:19)
    at handler (/api/sentry-test/route.ts:10:12)`

    console.log("[Sentry Test API] Created error:", error.message)

    // Explicitly capture with full options
    const eventId = Sentry.captureException(error, {
      tags: {
        test_type: "server_smoke_test",
        route: "/api/sentry-test",
        manual_test: "true",
      },
      level: "error",
      contexts: {
        test: {
          timestamp: new Date().toISOString(),
          test_run: "manual",
        },
      },
    })

    console.log("[Sentry Test API] ✓ Captured exception")
    console.log("[Sentry Test API] Event ID:", eventId)

    // Check if event ID is valid
    if (!eventId || eventId === "00000000000000000000000000000000") {
      console.log("[Sentry Test API] ⚠️  WARNING: Invalid event ID - event may not have been sent!")
    } else {
      console.log("[Sentry Test API] ✓ Valid event ID received")
    }

    // Flush to ensure event is sent
    console.log("[Sentry Test API] Flushing Sentry queue...")
    const flushed = await Sentry.flush(2000)
    console.log("[Sentry Test API] Flush result:", flushed)

    console.log("[Sentry Test API] ✓ Test complete")
    console.log("[Sentry Test API] Check Sentry dashboard:")
    console.log("[Sentry Test API] https://sentry.io/organizations/human-p5/issues/")
    console.log("[Sentry Test API] Filter: environment:development")
    console.log("========================================\n")

    // Return success response
    return NextResponse.json(
      {
        success: true,
        error: "Sentry Server Smoke Test Error",
        eventId: eventId,
        sentryInitialized: Sentry.isInitialized(),
        dsnConfigured: hasDsn,
        timestamp: new Date().toISOString(),
        dashboardUrl: "https://sentry.io/organizations/human-p5/issues/?environment=development",
      },
      { status: 500 }
    )
  } catch (err) {
    console.error("[Sentry Test API] ✗ Error during test:", err)
    return NextResponse.json(
      {
        success: false,
        error: String(err),
      },
      { status: 500 }
    )
  }
}
