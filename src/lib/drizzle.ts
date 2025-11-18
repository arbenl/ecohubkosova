import { drizzle } from "drizzle-orm/postgres-js"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@/db/schema"

let queryClient: ReturnType<typeof postgres> | null = null
let dbInstance: PostgresJsDatabase<typeof schema> | null = null
let connectionAttempts = 0
let needsReconnect = false // Track reconnection need
const MAX_RECONNECT_ATTEMPTS = 3
let hasLoggedClose = false

// Remove sslmode query param if present, we'll handle SSL in connection config
const connectionString = process.env.SUPABASE_DB_URL?.replace(/\?sslmode=\w+$/, '')

// Parse connection string to handle dots in username (Supabase pooler format)
const parseConnectionString = (connStr: string) => {
  const match = connStr.match(/^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/)
  if (!match) return null
  return {
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
    username: match[1],
    password: match[2],
  }
}

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

  // Clean up old connection if it exists
  if (queryClient) {
    try {
      queryClient.end({ timeout: 0 })
    } catch {
      // Ignore cleanup errors
    }
  }

  // Parse connection string to handle Supabase pooler format (dots in username)
  const parsed = parseConnectionString(connectionString)
  if (process.env.NODE_ENV === 'production') {
    console.log('[DB] Connection config:', parsed ? `Using parsed: ${parsed.username}@${parsed.host}` : 'Using connection string directly')
  } else {
    // In dev, prefer debug-level output to reduce noise in terminal.
    console.debug('[DB] Connection config (debug):', parsed ? `Using parsed: ${parsed.username}@${parsed.host}` : 'Using connection string directly')
  }
  
  queryClient = parsed 
    ? postgres({
        host: parsed.host,
        port: parsed.port,
        database: parsed.database,
        username: parsed.username,
        password: parsed.password,
        ssl: { rejectUnauthorized: false }, // Supabase pooler SSL config
        max: 10,
        idle_timeout: 60,
        max_lifetime: 1800,
        connect_timeout: 15,
        prepare: false,
        onclose: () => {
          // Only log the first close notification to avoid spamming logs during
          // rapid dev reloads or pooler churn. Mark that we need to reconnect.
          if (!hasLoggedClose) {
            console.warn("[DB] Connection closed, will reconnect on next query")
            hasLoggedClose = true
          } else {
            console.debug("[DB] Connection closed (suppressed duplicate)")
          }
          needsReconnect = true
        },
        onnotice: (notice) => {
          // Only surface serious notices.
          if (notice.severity === "FATAL" || notice.code === "28P01") {
            console.error("[DB] Fatal connection error detected, marking for reconnection")
            needsReconnect = true
          } else {
            console.debug("[DB] Notice:", notice)
          }
        },
      })
    : postgres(connectionString, {
        ssl: { rejectUnauthorized: false },
        max: 10,
        idle_timeout: 60,
        max_lifetime: 1800,
        connect_timeout: 15,
        prepare: false,
        onclose: () => {
          if (!hasLoggedClose) {
            console.warn("[DB] Connection closed, will reconnect on next query")
            hasLoggedClose = true
          } else {
            console.debug("[DB] Connection closed (suppressed duplicate)")
          }
          needsReconnect = true
        },
        onnotice: (notice) => {
          if (notice.severity === "FATAL" || notice.code === "28P01") {
            console.error("[DB] Fatal connection error detected, marking for reconnection")
            needsReconnect = true
          } else {
            console.debug("[DB] Notice:", notice)
          }
        },
      })

  dbInstance = drizzle(queryClient, { schema })
  connectionAttempts = 0 // Reset attempts on successful connection
  needsReconnect = false
  hasLoggedClose = false

  return dbInstance
}

/**
 * Gets or creates database connection with automatic reconnection.
 * If connection fails, it will be invalidated and recreated on next call.
 */
const ensureConnection = () => {
  // Check if we need to reconnect (connection was closed)
  if (needsReconnect || !dbInstance || !queryClient) {
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
      queryClient = null
      throw err
    }
  }

  return dbInstance
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
