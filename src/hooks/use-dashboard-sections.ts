"use client"

import { useMemo } from "react"

type Article = {
  id: string
  title: string
  users?: { full_name?: string | null } | null
}

type Partner = {
  id: string
  name: string
  type: string
  location: string
}

export function useLatestArticlesSection(latestArticles: Article[] = []) {
  const items = useMemo(
    () =>
      (latestArticles ?? []).map((article) => ({
        id: article.id,
        title: article.title,
        author: article.users?.full_name || "Autor i panjohur",
        href: `/qendra-e-dijes/${article.id}`,
      })),
    [latestArticles]
  )

  return {
    items,
    hasItems: items.length > 0,
    ctaHref: "/knowledge",
    ctaLabel: "Shiko të gjithë artikujt",
    emptyMessage: "Nuk ka artikuj të disponueshëm aktualisht.",
  }
}

export function useKeyPartnersSection(keyPartners: Partner[] = []) {
  const items = useMemo(
    () =>
      (keyPartners ?? []).map((partner) => ({
        id: partner.id,
        name: partner.name,
        meta: `${partner.type} • ${partner.location}`,
        href: `/drejtoria/${partner.id}`,
      })),
    [keyPartners]
  )

  return {
    items,
    hasItems: items.length > 0,
    ctaHref: "/drejtoria",
    ctaLabel: "Shiko të gjithë partnerët",
    emptyMessage: "Nuk ka partnerë të disponueshëm aktualisht.",
  }
}
