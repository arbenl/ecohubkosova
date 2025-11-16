/**
 * Next.js Instrumentation for graceful shutdown and connection management.
 * This file is loaded when Next.js starts and can register cleanup handlers.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import { closeDbConnection } from "@/lib/drizzle"

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Register graceful shutdown handlers for Node.js runtime
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

    // Register shutdown signals
    process.on("SIGTERM", () => handleShutdown("SIGTERM"))
    process.on("SIGINT", () => handleShutdown("SIGINT"))
  }
}
