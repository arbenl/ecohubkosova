// Update: src/services/session.ts
import { db } from "@/lib/drizzle"
import { users } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import { logAuthAction } from "@/lib/auth/logging"

interface SessionInfo {
  userId: string
  version: number
  role: string
  email: string
}

export async function getSessionInfo(userId: string): Promise<SessionInfo | null> {
  try {
    const user = await db
      .get()
      .select({
        id: users.id,
        session_version: users.session_version,
        role: users.role,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((result) => result[0] ?? null)

    if (!user) {
      logAuthAction("getSessionInfo", "User not found", { userId })
      return null
    }

    logAuthAction("getSessionInfo", "Retrieved session info", {
      userId,
      version: user.session_version,
      role: user.role,
    })

    return {
      userId: user.id,
      version: user.session_version,
      role: user.role,
      email: user.email,
    }
  } catch (error) {
    logAuthAction("getSessionInfo", "Error retrieving session", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

export async function incrementSessionVersion(userId: string): Promise<number | null> {
  try {
    const updated = await db
      .get()
      .update(users)
      .set({ session_version: sql`${users.session_version} + 1` })
      .where(eq(users.id, userId))
      .returning({ sessionVersion: users.session_version })

    const newVersion = updated?.[0]?.sessionVersion ?? null

    if (newVersion === null) {
      // No row was updated - user doesn't exist in public.users yet
      // This is normal for brand-new users before trigger runs
      logAuthAction("incrementSessionVersion", "No user row to update (new user)", {
        userId,
        info: "User profile not created yet - this is normal for first login",
      })
      return null
    }

    logAuthAction("incrementSessionVersion", "Session version incremented", {
      userId,
      newVersion,
    })

    return newVersion
  } catch (error) {
    // Surface actual Postgres error for debugging
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorDetails = error instanceof Error && 'code' in error 
      ? { code: (error as any).code, detail: (error as any).detail } 
      : {}
    
    console.error("[incrementSessionVersion] SQL error", {
      userId,
      error: errorMessage,
      ...errorDetails,
    })

    logAuthAction("incrementSessionVersion", "Database error", {
      userId,
      error: errorMessage,
      ...errorDetails,
    })
    
    return null
  }
}

export async function validateSessionVersion(userId: string, clientVersion: string | null): Promise<boolean> {
  const sessionInfo = await getSessionInfo(userId)

  if (!sessionInfo) {
    logAuthAction("validateSessionVersion", "Session info not found", { userId })
    return false
  }

  const dbVersion = String(sessionInfo.version)
  const isValid = !clientVersion || clientVersion === dbVersion

  logAuthAction("validateSessionVersion", isValid ? "Valid" : "Invalid", {
    userId,
    clientVersion,
    dbVersion,
    isValid,
  })

  return isValid
}