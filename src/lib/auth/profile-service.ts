import type { SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js"
import type { UserProfile } from "@/types"

type AnySupabaseClient = SupabaseClient<any, any, any>

const profileColumns = "id, emri_i_plote, email, vendndodhja, roli, eshte_aprovuar, created_at"

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
  const { data, error } = await supabase
    .from("users")
    .select(profileColumns)
    .eq("id", userId)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (data) {
    return data as UserProfile
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

  const { data: createdProfile, error: insertError } = await supabase
    .from("users")
    .insert(newProfile)
    .select(profileColumns)
    .single()

  if (insertError) {
    throw insertError
  }

  return createdProfile as UserProfile
}
