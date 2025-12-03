"use server"

import { and, count, eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { ecoListings, ecoListingInteractions } from "@/db/schema/marketplace-v2"
import { organizationMembers } from "@/db/schema"
import { getServerUser } from "@/lib/supabase/server"

export interface UserStats {
  savedListings: number
  organizations: number
  myListings: number
}

type GetUserStatsResult = {
  data: UserStats | null
  error: string | null
}

export async function getUserStats(): Promise<GetUserStatsResult> {
  const { user } = await getServerUser()
  if (!user) {
    return { data: null, error: "User not authenticated" }
  }

  try {
    const database = db.get()
    const [savedListings, organizations, myListings] = await Promise.all([
      database
        .select({ value: count() })
        .from(ecoListingInteractions)
        .where(
          and(
            eq(ecoListingInteractions.user_id, user.id),
            eq(ecoListingInteractions.interaction_type, "SAVE")
          )
        ),
      database
        .select({ value: count() })
        .from(organizationMembers)
        .where(eq(organizationMembers.user_id, user.id)),
      database
        .select({ value: count() })
        .from(ecoListings)
        .where(eq(ecoListings.created_by_user_id, user.id)),
    ])

    const stats: UserStats = {
      savedListings: savedListings[0]?.value ?? 0,
      organizations: organizations[0]?.value ?? 0,
      myListings: myListings[0]?.value ?? 0,
    }

    return { data: stats, error: null }
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred while fetching user stats.",
    }
  }
}
