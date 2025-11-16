"use client"

import { BookOpen, Building, ShoppingCart, Users } from "lucide-react"
import { useMemo } from "react"

const CARD_DEFINITIONS = [
  {
    key: "organizationsCount",
    title: "Organizata",
    description: "Të aprovuara",
    Icon: Building,
  },
  {
    key: "articlesCount",
    title: "Artikuj",
    description: "Të publikuar",
    Icon: BookOpen,
  },
  {
    key: "usersCount",
    title: "Anëtarë",
    description: "Të regjistruar",
    Icon: Users,
  },
  {
    key: "listingsCount",
    title: "Listime",
    description: "Në treg",
    Icon: ShoppingCart,
  },
] as const

type Stats = Record<(typeof CARD_DEFINITIONS)[number]["key"], number>

export function useDashboardStatsCards(stats: Stats) {
  return useMemo(
    () =>
      CARD_DEFINITIONS.map(({ key, title, description, Icon }) => ({
        title,
        description,
        value: stats?.[key] ?? 0,
        Icon,
      })),
    [stats]
  )
}
