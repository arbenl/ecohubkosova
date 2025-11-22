"use server"

import { getOrganizationAnalytics, getDateForRange, type AnalyticsOptions } from "@/services/analytics"

export async function fetchOrganizationAnalyticsAction(
  organizationId: string,
  timeRange: "last30Days" | "last90Days" | "allTime"
) {
  const since = getDateForRange(timeRange)
  const { data, error } = await getOrganizationAnalytics(organizationId, { since })

  return { data, error }
}
