import { NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { users } from "@/db/schema"
import {
  diagnosticsNoStoreHeaders,
  diagnosticsNotFoundResponse,
  hasDiagnosticsAccess,
} from "@/lib/diagnostics-access"

export const dynamic = "force-dynamic"

export interface HealthCheckResponse {
  status: "healthy" | "error"
  timestamp: string
  database: {
    connected: boolean
    error?: string
    responseTime?: number
  }
}

export async function GET(request: Request): Promise<NextResponse> {
  if (!hasDiagnosticsAccess(request)) {
    return diagnosticsNotFoundResponse()
  }

  const startTime = Date.now()

  try {
    // Attempt a simple query to verify connection
    await db.get().select({ id: users.id }).from(users).limit(1)

    const responseTime = Date.now() - startTime

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          responseTime,
        },
      },
      { headers: diagnosticsNoStoreHeaders }
    )
  } catch (error) {
    const responseTime = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : String(error)

    console.error("[health/db] Database health check failed:", {
      error: errorMsg,
      responseTime,
    })

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: errorMsg,
          responseTime,
        },
      },
      { status: 503, headers: diagnosticsNoStoreHeaders } // Service Unavailable
    )
  }
}
