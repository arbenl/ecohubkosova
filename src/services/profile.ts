import { unstable_noStore as noStore } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { organizationMembers, organizations, users } from "@/db/schema"
import type { OrganizationProfileUpdateInput, UserProfileUpdateInput } from "@/validation/profile"

export type ProfileUser = {
  id: string
  emri_i_plote: string
  email: string
  vendndodhja: string
  roli: string
  eshte_aprovuar: boolean
  created_at: string
}

export type ProfileOrganization = {
  id: string
  emri: string
  pershkrimi: string
  interesi_primar: string
  person_kontakti: string
  email_kontakti: string
  vendndodhja: string
  lloji: string
  eshte_aprovuar: boolean
}

type UserRow = typeof users.$inferSelect
type OrganizationRow = typeof organizations.$inferSelect

const toProfileUser = (record: UserRow): ProfileUser => ({
  id: record.id,
  emri_i_plote: record.emri_i_plote,
  email: record.email,
  vendndodhja: record.vendndodhja,
  roli: record.roli,
  eshte_aprovuar: record.eshte_aprovuar,
  created_at: record.created_at.toISOString(),
})

const toProfileOrganization = (record: OrganizationRow): ProfileOrganization => ({
  id: record.id,
  emri: record.emri,
  pershkrimi: record.pershkrimi,
  interesi_primar: record.interesi_primar,
  person_kontakti: record.person_kontakti,
  email_kontakti: record.email_kontakti,
  vendndodhja: record.vendndodhja,
  lloji: record.lloji,
  eshte_aprovuar: record.eshte_aprovuar,
})

async function findUserProfile(userId: string) {
  try {
    const records = await db.get().select().from(users).where(eq(users.id, userId)).limit(1)
    const record = records[0]
    return record ? toProfileUser(record) : null
  } catch (error) {
    console.error("findUserProfile error:", error)
    return null
  }
}

export async function fetchCurrentUserProfile() {
  noStore()
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser()

  if (sessionError || !user) {
    return { userProfile: null, organization: null, error: "Përdoruesi nuk është i kyçur." }
  }

  try {
    const userProfile = await findUserProfile(user.id)
    if (!userProfile) {
      console.warn("fetchCurrentUserProfile: no profile, using auth user metadata")
    }

    let organization: ProfileOrganization | null = null

    if (userProfile && userProfile.roli !== "Individ" && userProfile.roli !== "Admin") {
      const memberships = await db
        .get()
        .select({ organization_id: organizationMembers.organization_id })
        .from(organizationMembers)
        .where(and(eq(organizationMembers.user_id, user.id), eq(organizationMembers.eshte_aprovuar, true)))
        .limit(1)
      const membership = memberships[0]

      if (membership?.organization_id) {
        const orgRecords = await db
          .get()
          .select()
          .from(organizations)
          .where(eq(organizations.id, membership.organization_id))
          .limit(1)
        const orgRecord = orgRecords[0]

        if (orgRecord) {
          organization = toProfileOrganization(orgRecord)
        }
      }
    }

    return {
      userProfile,
      organization,
      error: userProfile ? null : "Profili i përdoruesit nuk u gjet.",
    }
  } catch (error) {
    console.error("fetchCurrentUserProfile error:", error)
    return {
      userProfile: null,
      organization: null,
      error: error instanceof Error ? error.message : "Gabim gjatë ngarkimit të profilit.",
    }
  }
}

export async function fetchUserProfileById(userId: string) {
  noStore()

  try {
    const profile = await findUserProfile(userId)

    if (!profile) {
      throw new Error("Profili i përdoruesit nuk ekziston.")
    }

    return { userProfile: profile, error: null as string | null }
  } catch (error) {
    console.error("fetchUserProfileById error:", error)
    return {
      userProfile: null,
      error: error instanceof Error ? error.message : "Gabim gjatë ngarkimit të profilit të përdoruesit.",
    }
  }
}

export async function updateUserProfileRecord(userId: string, data: UserProfileUpdateInput) {
  try {
    await db
      .get()
      .update(users)
      .set({
        emri_i_plote: data.emri_i_plote,
        vendndodhja: data.vendndodhja,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId))

    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

export async function updateOrganizationRecord(
  organizationId: string,
  data: OrganizationProfileUpdateInput
) {
  try {
    await db
      .get()
      .update(organizations)
      .set({
        emri: data.emri,
        pershkrimi: data.pershkrimi,
        interesi_primar: data.interesi_primar,
        person_kontakti: data.person_kontakti,
        email_kontakti: data.email_kontakti,
        vendndodhja: data.vendndodhja,
        updated_at: new Date(),
      })
      .where(eq(organizations.id, organizationId))

    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

export async function ensureUserOrganizationMembership(
  organizationId: string,
  userId: string
) {
  try {
    const records = await db
      .get()
      .select({ id: organizationMembers.id })
      .from(organizationMembers)
      .where(and(eq(organizationMembers.organization_id, organizationId), eq(organizationMembers.user_id, userId)))
      .limit(1)
    const record = records[0]

    return { isMember: Boolean(record), error: null }
  } catch (error) {
    return { isMember: false, error: error as Error }
  }
}
