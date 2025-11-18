import { eq } from "drizzle-orm"
import type { SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js"
import type { UserProfile } from "@/types"
import { db } from "@/lib/drizzle"
import { users } from "@/db/schema"
import { logAuthAction } from "@/lib/auth/logging"

type AnySupabaseClient = SupabaseClient<any, any, any>

async function buildNewProfilePayload(userId: string, authUser: SupabaseUser): Promise<Omit<UserProfile, "created_at">> {
  const fallbackName = authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Përdorues"

  return {
    id: userId,
    full_name: fallbackName,
    email: authUser.email || "",
    location: authUser.user_metadata?.location || "",
    role: "Individ",
    is_approved: false,
  }
}

/**
 * Ensures a user profile exists in the database.
 * 
 * Returns:
 * - Existing profile row if found (normal case for active users)
 * - null if no profile exists (normal case for new users - will be created by trigger)
 * - null on auth/connection errors (caller handles gracefully)
 * 
 * Important: A null return does NOT mean an error occurred.
 * Check error logs to distinguish between "new user has no profile yet" (normal)
 * vs "database connection failed" (error, logged separately).
 */
export async function ensureUserProfileExists(
  supabase: AnySupabaseClient,
  userId: string
): Promise<UserProfile | null> {
  let records
  try {
    records = await db.get().select().from(users).where(eq(users.id, userId)).limit(1)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    // Check if it's an authentication/connection error vs other query errors
    // Error code 28P01 = "password authentication failed" (wrong pooler URL or credentials)
    const isAuthError = 
      message.includes("28P01") || // Password authentication failed
      message.includes("connection") ||
      message.includes("SUPABASE_DB_URL")
    
    if (isAuthError) {
      // Log auth/connection errors separately with full context for debugging
      console.error('[profileService] Database connection/auth failed:', {
        userId,
        authError: true,
        errorCode: (error as any)?.code,
        message
      })
      logAuthAction("profileService", "DB connection failed", { userId, error: message })
      // Return null gracefully for connection errors - caller will handle gracefully
      return null
    }

    // For other query errors, log and throw
    logAuthAction("profileService", "DB select failed", { userId, error: message })
    throw error
  }

  const existing = records[0]

  if (existing) {
    return {
      id: existing.id,
      full_name: existing.full_name,
      email: existing.email,
      location: existing.location,
      role: existing.role,
      is_approved: existing.is_approved,
      created_at: existing.created_at.toISOString(),
    }
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    throw authError
  }

  if (!user) {
    return null
  }

  const newProfile = await buildNewProfilePayload(userId, user)

  let created
  try {
    created = await db
      .get()
      .insert(users)
      .values({
        id: userId,
        full_name: newProfile.full_name,
        email: newProfile.email,
        location: newProfile.location,
        role: newProfile.role,
        is_approved: newProfile.is_approved,
      })
      .returning()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    // Check if it's an authentication/connection error
    const isAuthError = 
      message.includes("28P01") || // Password authentication failed
      message.includes("connection") ||
      message.includes("SUPABASE_DB_URL")

    if (isAuthError) {
      console.error('[profileService] Database connection/auth failed during profile creation:', {
        userId,
        authError: true,
        errorCode: (error as any)?.code,
        message
      })
      logAuthAction("profileService", "DB connection failed", { userId, error: message })
      return null
    }

    logAuthAction("profileService", "DB insert failed", { userId, error: message })
    throw error
  }

  const createdProfile = created?.[0]

  if (!createdProfile) {
    return null
  }

  return {
    id: createdProfile.id,
    full_name: createdProfile.full_name,
    email: createdProfile.email,
    location: createdProfile.location,
    role: createdProfile.role,
    is_approved: createdProfile.is_approved,
    created_at: createdProfile.created_at.toISOString(),
  }
}
