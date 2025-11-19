import { NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { users } from "@/db/schema"

export const dynamic = "force-dynamic"

export interface HealthCheckResponse {
  status: "healthy" | "unhealthy"
  timestamp: string
  services: {
    database: "healthy" | "unhealthy"
    cache: "healthy" | "unhealthy"
  }
}

export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  const startTime = Date.now()
  let databaseStatus: "healthy" | "unhealthy" = "healthy"

  try {
    // Attempt a simple query to verify database connection
    await db.get().select({ id: users.id }).from(users).limit(1)
  } catch (error) {
    databaseStatus = "unhealthy"
    console.error("[health] Database health check failed:", error)
  }

  const overallStatus = databaseStatus === "healthy" ? "healthy" : "unhealthy"

  return NextResponse.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    services: {
      database: databaseStatus,
      cache: "healthy", // Cache check could be implemented later
    },
  }, {
    status: overallStatus === "healthy" ? 200 : 503
  })
}