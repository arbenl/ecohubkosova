/**
 * Database health check and recovery utilities.
 * Helps identify and recover from connection issues.
 */

import { db } from "./drizzle"

export interface DbHealthStatus {
  healthy: boolean
  message: string
  timestamp: Date
  lastError?: string
}

let lastHealthCheck: DbHealthStatus | null = null
let healthCheckInterval: NodeJS.Timeout | null = null

/**
 * Performs a simple health check on the database connection.
 * Useful for monitoring and debugging connection issues.
 */
export const checkDatabaseHealth = async (): Promise<DbHealthStatus> => {
  try {
    const database = db.get()

    // Simple query to test connection
    const result = await database.execute(`SELECT 1`)

    lastHealthCheck = {
      healthy: true,
      message: "Database connection is healthy",
      timestamp: new Date(),
    }

    return lastHealthCheck
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"

    lastHealthCheck = {
      healthy: false,
      message: "Database connection failed",
      timestamp: new Date(),
      lastError: message,
    }

    console.error("[DB Health Check]", lastHealthCheck)

    return lastHealthCheck
  }
}

/**
 * Gets the last recorded health check status.
 */
export const getLastHealthStatus = (): DbHealthStatus | null => {
  return lastHealthCheck
}

/**
 * Starts periodic health checks (useful for monitoring).
 * Only starts if not already running.
 *
 * @param intervalMs Interval in milliseconds (default: 5 minutes)
 */
export const startHealthChecking = (intervalMs = 5 * 60 * 1000) => {
  if (healthCheckInterval) {
    console.warn("[DB Health] Health checking already running")
    return
  }

  console.log(`[DB Health] Starting periodic health checks every ${intervalMs}ms`)

  healthCheckInterval = setInterval(async () => {
    const status = await checkDatabaseHealth()
    if (!status.healthy) {
      console.warn("[DB Health] Connection unhealthy:", status.lastError)
    }
  }, intervalMs)

  // Don't prevent process exit
  healthCheckInterval.unref?.()
}

/**
 * Stops periodic health checking.
 */
export const stopHealthChecking = () => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval)
    healthCheckInterval = null
    console.log("[DB Health] Health checking stopped")
  }
}
