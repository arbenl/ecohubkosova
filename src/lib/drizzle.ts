import { drizzle } from "drizzle-orm/postgres-js"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@/db/schema"

let queryClient: ReturnType<typeof postgres> | null = null
let dbInstance: PostgresJsDatabase<typeof schema> | null = null

const connectionString = process.env.SUPABASE_DB_URL

const ensureConnection = () => {
  if (dbInstance) {
    return dbInstance
  }

  if (!connectionString) {
    throw new Error(
      "Missing SUPABASE_DB_URL. Set it in your environment to enable Drizzle ORM access to the Supabase database."
    )
  }

  queryClient = postgres(connectionString, {
    ssl: "require",
  })

  dbInstance = drizzle(queryClient, { schema })

  return dbInstance
}

export const db = {
  get: () => ensureConnection(),
}
