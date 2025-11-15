"use server"

import { createServerActionSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { registrationSchema } from "@/validation/auth"
import { db } from "@/lib/drizzle"
import { organizationMembers, organizations, users } from "@/db/schema"
import { SESSION_VERSION_COOKIE, SESSION_VERSION_COOKIE_OPTIONS } from "@/lib/auth/session-version"

type UserRole = "Individ" | "OJQ" | "Ndërmarrje Sociale" | "Kompani"

interface RegistrationFormData {
  emri_i_plote: string
  email: string
  password: string
  vendndodhja: string
  roli: UserRole
  emri_organizates?: string
  pershkrimi_organizates?: string
  interesi_primar?: string
  person_kontakti?: string
  email_kontakti?: string
  newsletter: boolean
}

export async function registerUser(formData: RegistrationFormData) {
  const supabase = await createServerActionSupabaseClient()

  try {
    const parsed = registrationSchema.safeParse(formData)
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || "Të dhënat e regjistrimit nuk janë të vlefshme." }
    }
    const payload = parsed.data

    // 1. Sign up the user with Supabase Auth
    const { data: signUpData, error: authError } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
emri_i_plote: payload.emri_i_plote,
          roli: payload.roli,
        },
      },
    })

    if (authError) {
      if (authError.message.includes("User already registered")) {
        return { error: "Ky email është tashmë i regjistruar. Ju lutemi kyçuni." }
      }
      throw authError
    }

    // Ensure user is available after sign-up.
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user?.id) {
      throw new Error("Nuk u arrit të merret përdoruesi pas regjistrimit.")
    }

    const userId = userData.user.id

    await db.get().transaction(async (tx) => {
      await tx
        .insert(users)
        .values({
          id: userId,
          emri_i_plote: payload.emri_i_plote,
          email: payload.email,
          vendndodhja: payload.vendndodhja,
          roli: "Individ",
          eshte_aprovuar: payload.roli === "Individ",
        })
        .onConflictDoNothing({ target: users.id })

      if (payload.roli !== "Individ") {
        const [organization] = await tx
          .insert(organizations)
          .values({
            emri: payload.emri_organizates!,
            pershkrimi: payload.pershkrimi_organizates!,
            interesi_primar: payload.interesi_primar!,
            person_kontakti: payload.person_kontakti!,
            email_kontakti: payload.email_kontakti!,
            vendndodhja: payload.vendndodhja,
            lloji: payload.roli,
            eshte_aprovuar: false,
          })
          .returning({ id: organizations.id })

        if (!organization?.id) {
          throw new Error("Nuk u arrit të krijohet organizata.")
        }

        await tx.insert(organizationMembers).values({
          organization_id: organization.id,
          user_id: userId,
          roli_ne_organizate: "themelues",
          eshte_aprovuar: true,
        })
      }
    })

    const cookieStore = await cookies()
    cookieStore.set(SESSION_VERSION_COOKIE, "1", SESSION_VERSION_COOKIE_OPTIONS)

    // Revalidate paths that might display user/organization data
    revalidatePath("/dashboard")
    revalidatePath("/profili")
    revalidatePath("/drejtoria")

    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (registerUser):", error)
    return { error: error.message || "Gabim i panjohur gjatë regjistrimit. Ju lutemi provoni përsëri." }
  }
}
