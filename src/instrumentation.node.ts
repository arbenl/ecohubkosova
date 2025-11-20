/**
 * Node-only instrumentation (graceful shutdown, DB cleanup).
 * Loaded dynamically from src/instrumentation.ts when NEXT_RUNTIME === "nodejs".
 */

import { closeDbConnection } from "@/lib/drizzle"

export async function registerNodeInstrumentation() {
  const handleShutdown = async (signal: string) => {
    console.log(`[Shutdown] Received ${signal}, closing gracefully...`)
    try {
      await closeDbConnection()
      console.log("[Shutdown] Database connections closed")
    } catch (err) {
      console.error("[Shutdown] Error during graceful shutdown:", err)
    }
    process.exit(0)
  }

  process.on("SIGTERM", () => handleShutdown("SIGTERM"))
  process.on("SIGINT", () => handleShutdown("SIGINT"))
}
