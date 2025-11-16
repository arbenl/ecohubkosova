"use client"

import { useMemo } from "react"

type Article = {
  id: string
  titulli: string
  users?: { emri_i_plote?: string | null } | null
}

type Partner = {
  id: string
  emri: string
  lloji: string
  vendndodhja: string
}

export function useLatestArticlesSection(latestArticles: Article[] = []) {
  const items = useMemo(
    () =>
      (latestArticles ?? []).map((article) => ({
        id: article.id,
        title: article.titulli,
        author: article.users?.emri_i_plote || "Autor i panjohur",
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
        name: partner.emri,
        meta: `${partner.lloji} • ${partner.vendndodhja}`,
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
