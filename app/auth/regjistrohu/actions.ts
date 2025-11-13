"use server"

import { createServerActionSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { registrationSchema } from "@/src/validation/auth"

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
  const supabase = createServerActionSupabaseClient()

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

    // 2. Insert user profile into the 'public.users' table
    const { error: profileError } = await supabase.from("users").insert({
      id: userId,
      emri_i_plote: payload.emri_i_plote,
      email: payload.email,
      vendndodhja: payload.vendndodhja,
      roli: "Individ", // All base users are "Individ" in public.users
      eshte_aprovuar: payload.roli === "Individ", // Individuals approved by default
    })

    if (profileError && profileError.code !== "23505") throw profileError

    // 3. If the user registered as an organization, insert into 'public.organizations'
    if (payload.roli !== "Individ") {
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .insert({
          emri: payload.emri_organizates!,
          pershkrimi: payload.pershkrimi_organizates!,
          interesi_primar: payload.interesi_primar!,
          person_kontakti: payload.person_kontakti!,
          email_kontakti: payload.email_kontakti!,
          vendndodhja: payload.vendndodhja,
          lloji: payload.roli,
          eshte_aprovuar: false, // Organizations always require approval
        })
        .select()
        .single()

      if (orgError) throw orgError

      // Link the newly registered user as a member of the organization
      const { error: memberError } = await supabase.from("organization_members").insert({
        organization_id: orgData.id,
        user_id: userId,
        roli_ne_organizate: "themelues",
        eshte_aprovuar: true, // Founder is automatically approved as a member
      })

      if (memberError) throw memberError
    }

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
