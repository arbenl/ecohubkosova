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
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        session_version: true,
        roli: true,
        email: true,
      },
    })

    if (!user) {
      logAuthAction("getSessionInfo", "User not found", { userId })
      return null
    }

    logAuthAction("getSessionInfo", "Retrieved session info", {
      userId,
      version: user.session_version,
      role: user.roli,
    })

    return {
      userId: user.id,
      version: user.session_version,
      role: user.roli,
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
    const [updated] = await db
      .update(users)
      .set({ session_version: sql`${users.session_version} + 1` })
      .where(eq(users.id, userId))
      .returning({ sessionVersion: users.session_version })

    const newVersion = updated?.sessionVersion ?? null

    logAuthAction("incrementSessionVersion", "Session version incremented", {
      userId,
      newVersion,
    })

    return newVersion
  } catch (error) {
    logAuthAction("incrementSessionVersion", "Error incrementing version", {
      userId,
      error: error instanceof Error ? error.message : String(error),
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
