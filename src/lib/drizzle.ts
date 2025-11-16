import { drizzle } from "drizzle-orm/postgres-js"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@/db/schema"

let queryClient: ReturnType<typeof postgres> | null = null
let dbInstance: PostgresJsDatabase<typeof schema> | null = null
let connectionAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 3

const connectionString = process.env.SUPABASE_DB_URL

/**
 * Creates a new database connection with proper error handling and reconnection logic.
 * Supabase pooler connections can timeout or be recycled, so we need robust handling.
 */
const createConnection = () => {
  if (!connectionString) {
    throw new Error(
      "Missing SUPABASE_DB_URL. Set it in your environment to enable Drizzle ORM access to the Supabase database."
    )
  }

  queryClient = postgres(connectionString, {
    ssl: "require",
    max: 10, // Reduced pool size for better stability
    idle_timeout: 60, // Keep idle connections alive longer (60 seconds)
    max_lifetime: 1800, // 30 minutes (Supabase default is 10-15 minutes for pooler)
    connect_timeout: 15, // Increased connection timeout
    
    // Reconnect on idle timeout
    onclose: () => {
      console.warn("[DB] Connection closed, clearing instance for reconnection")
      dbInstance = null
    },
    
    // Handle connection errors
    onnotice: (notice) => {
      if (notice.severity === "FATAL" || notice.code === "28P01") {
        console.error("[DB] Fatal connection error detected, clearing connection pool")
        dbInstance = null
      }
    },
  })

  dbInstance = drizzle(queryClient, { schema })
  connectionAttempts = 0 // Reset attempts on successful connection

  return dbInstance
}

/**
 * Gets or creates database connection with automatic reconnection.
 * If connection fails, it will be invalidated and recreated on next call.
 */
const ensureConnection = () => {
  if (dbInstance) {
    return dbInstance
  }

  if (connectionAttempts >= MAX_RECONNECT_ATTEMPTS) {
    throw new Error(
      "Failed to establish database connection after multiple attempts. Please check your SUPABASE_DB_URL environment variable."
    )
  }

  connectionAttempts++
  console.log(`[DB] Establishing connection (attempt ${connectionAttempts}/${MAX_RECONNECT_ATTEMPTS})`)

  try {
    return createConnection()
  } catch (err) {
    console.error(`[DB] Connection attempt ${connectionAttempts} failed:`, err)
    dbInstance = null
    throw err
  }
}

/**
 * Gracefully close database connections on app shutdown.
 * This prevents dangling connections that can cause authentication issues.
 */
export const closeDbConnection = async () => {
  if (queryClient) {
    try {
      console.log("[DB] Closing database connections")
      await queryClient.end()
      queryClient = null
      dbInstance = null
    } catch (err) {
      console.error("[DB] Error closing connection:", err)
    }
  }
}

export const db = {
  get: () => ensureConnection(),
}
