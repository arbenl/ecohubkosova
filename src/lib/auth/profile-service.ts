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
    emri_i_plote: fallbackName,
    email: authUser.email || "",
    vendndodhja: authUser.user_metadata?.location || "",
    roli: "Individ",
    eshte_aprovuar: false,
  }
}

export async function ensureUserProfileExists(
  supabase: AnySupabaseClient,
  userId: string
): Promise<UserProfile | null> {
  let records
  try {
    records = await db.get().select().from(users).where(eq(users.id, userId)).limit(1)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logAuthAction("profileService", "DB select failed", { userId, error: message })
    if (
      message.includes("SUPABASE_DB_URL") ||
      message.includes("connection") ||
      message.includes("Failed query")
    ) {
      return null
    }
    throw error
  }
  const existing = records[0]

  if (existing) {
    return {
      id: existing.id,
      emri_i_plote: existing.emri_i_plote,
      email: existing.email,
      vendndodhja: existing.vendndodhja,
      roli: existing.roli,
      eshte_aprovuar: existing.eshte_aprovuar,
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
        emri_i_plote: newProfile.emri_i_plote,
        email: newProfile.email,
        vendndodhja: newProfile.vendndodhja,
        roli: newProfile.roli,
        eshte_aprovuar: newProfile.eshte_aprovuar,
      })
      .returning()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logAuthAction("profileService", "DB insert failed", { userId, error: message })
    if (
      message.includes("SUPABASE_DB_URL") ||
      message.includes("connection") ||
      message.includes("Failed query")
    ) {
      return null
    }
    throw error
  }

  const createdProfile = created?.[0]

  if (!createdProfile) {
    return null
  }

  return {
    id: createdProfile.id,
    emri_i_plote: createdProfile.emri_i_plote,
    email: createdProfile.email,
    vendndodhja: createdProfile.vendndodhja,
    roli: createdProfile.roli,
    eshte_aprovuar: createdProfile.eshte_aprovuar,
    created_at: createdProfile.created_at.toISOString(),
  }
}
