"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { registrationSchema } from "@/validation/auth"
import { db } from "@/lib/drizzle"
import { organizationMembers, organizations, users } from "@/db/schema"
import { SESSION_VERSION_COOKIE, SESSION_VERSION_COOKIE_OPTIONS } from "@/lib/auth/session-version"

type UserRole = "Individ" | "OJQ" | "Ndërmarrje Sociale" | "Kompani"

interface RegistrationFormData {
  full_name: string
  email: string
  password: string
  location: string
  role: UserRole
  organization_name?: string
  organization_description?: string
  primary_interest?: string
  contact_person?: string
  contact_email?: string
  newsletter: boolean
}

export async function registerUser(formData: RegistrationFormData) {
  const supabase = await createServerSupabaseClient()

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
          full_name: payload.full_name,
          role: payload.role,
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
          full_name: payload.full_name,
          email: payload.email,
          location: payload.location,
          role: "Individ",
          is_approved: payload.role === "Individ",
        })
        .onConflictDoNothing({ target: users.id })

      if (payload.role !== "Individ") {
        const [organization] = await tx
          .insert(organizations)
          .values({
            name: payload.organization_name!,
            description: payload.organization_description!,
            primary_interest: payload.primary_interest!,
            contact_person: payload.contact_person!,
            contact_email: payload.contact_email!,
            location: payload.location,
            type: payload.role,
            is_approved: false,
          })
          .returning({ id: organizations.id })

        if (!organization?.id) {
          throw new Error("Nuk u arrit të krijohet organizata.")
        }

        await tx.insert(organizationMembers).values({
          organization_id: organization.id,
          user_id: userId,
          role_in_organization: "themelues",
          is_approved: true,
        })
      }
    })

    try {
      const cookieStore = await cookies()
      cookieStore.set(SESSION_VERSION_COOKIE, "1", SESSION_VERSION_COOKIE_OPTIONS)
    } catch (cookieError) {
      // Session versioning is optional, don't fail registration if it fails
      console.warn("Failed to set session version cookie:", cookieError)
    }

    // Revalidate paths that might display user/organization data
    revalidatePath("/dashboard")
    revalidatePath("/profile")
    revalidatePath("/drejtoria")

    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (registerUser):", error)
    // Use generic error message to prevent account enumeration
    return { error: "Regjistrimi dështoi. Ju lutemi provoni më vonë ose kontaktoni suportën." }
  }
}
