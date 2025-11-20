"use client"

import { BookOpen, Building, ShoppingCart, Users } from "lucide-react"
import { useMemo } from "react"

const CARD_DEFINITIONS = [
  {
    key: "organizationsCount",
    titleKey: "organizations",
    descriptionKey: "organizationsDesc",
    Icon: Building,
  },
  {
    key: "articlesCount",
    titleKey: "articles",
    descriptionKey: "articlesDesc",
    Icon: BookOpen,
  },
  {
    key: "usersCount",
    titleKey: "members",
    descriptionKey: "membersDesc",
    Icon: Users,
  },
  {
    key: "listingsCount",
    titleKey: "listings",
    descriptionKey: "listingsDesc",
    Icon: ShoppingCart,
  },
] as const

type Stats = Record<(typeof CARD_DEFINITIONS)[number]["key"], number>

export function useDashboardStatsCards(stats: Stats, t: (key: string) => string) {
  return useMemo(
    () =>
      CARD_DEFINITIONS.map(({ key, titleKey, descriptionKey, Icon }) => ({
        title: t(`dashboard.${titleKey}`),
        description: t(`dashboard.${descriptionKey}`),
        value: stats?.[key] ?? 0,
        Icon,
      })),
    [stats, t]
  )
}
