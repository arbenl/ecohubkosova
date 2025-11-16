"use server"

import { requireAdminRole } from "@/lib/auth/roles"
import { fetchAdminStats, type AdminStats } from "@/services/admin/stats"

type GetAdminStatsResult = {
  data: AdminStats | null
  error: string | null
}

export async function getAdminStats(): Promise<GetAdminStatsResult> {
  // Verify admin authorization before proceeding
  await requireAdminRole()

  const { data, error } = await fetchAdminStats()

  if (error) {
    console.error("Server Action Error (getAdminStats):", error)
    return {
      data: null,
      error: error.message || "Gabim gjatë marrjes së statistikave.",
    }
  }

  return { data, error: null }
}
