"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import * as Sentry from "@sentry/nextjs"

export default function SentryTestPage() {
  const [isProduction, setIsProduction] = useState(false)
  const [eventId, setEventId] = useState<string | null>(null)

  useEffect(() => {
    // Check if we're in production
    const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV
    setIsProduction(vercelEnv === "production")

    // Log DSN status for debugging
    const hasDsn = !!process.env.NEXT_PUBLIC_SENTRY_DSN
    console.log("[Sentry Test] Client DSN present:", hasDsn)
    console.log("[Sentry Test] Environment:", process.env.NODE_ENV)
  }, [])

  const handleThrowError = () => {
    console.log("[Sentry Test] Button clicked, throwing error...")

    // Explicitly capture the exception first
    const error = new Error("Sentry Client Smoke Test Error")
    const id = Sentry.captureException(error)

    console.log("[Sentry Test] Captured exception with event ID:", id)
    setEventId(id)

    // Then throw to trigger React error boundary
    throw error
  }

  if (isProduction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <h1 className="text-2xl font-bold">Page Not Available</h1>
        <p className="text-muted-foreground">This test page is not available in production.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
      <h1 className="text-2xl font-bold">Sentry Smoke Test</h1>
      <p className="text-muted-foreground">
        Click the button below to trigger a client-side error.
      </p>
      <Button variant="destructive" onClick={handleThrowError}>
        Throw Client Error
      </Button>
      {eventId && <p className="text-xs text-green-600 mt-2">Event captured: {eventId}</p>}
      <p className="text-xs text-muted-foreground mt-4">
        Environment: {process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "unknown"}
      </p>
      <p className="text-xs text-muted-foreground">
        DSN configured: {process.env.NEXT_PUBLIC_SENTRY_DSN ? "Yes" : "No"}
      </p>
    </div>
  )
}
