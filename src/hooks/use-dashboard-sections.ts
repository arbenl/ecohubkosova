"use client"

import { useMemo } from "react"
import { useLocale } from "next-intl"

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
  const locale = useLocale()
  const items = useMemo(
    () =>
      (latestArticles ?? []).map((article) => ({
        id: article.id,
        title: article.title,
        author: article.users?.full_name || "Autor i panjohur",
        href: `/${locale}/knowledge/articles/${article.id}`,
      })),
    [latestArticles, locale]
  )

  return {
    items,
    hasItems: items.length > 0,
    ctaHref: `/${locale}/knowledge`,
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
        href: `/partners/${partner.id}`,
      })),
    [keyPartners]
  )

  return {
    items,
    hasItems: items.length > 0,
    ctaHref: "/partners",
    ctaLabel: "Shiko të gjithë partnerët",
    emptyMessage: "Nuk ka partnerë të disponueshëm aktualisht.",
  }
}
