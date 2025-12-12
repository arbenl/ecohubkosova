/**
 * EcoHub Kosova – Dynamic Sitemap Generator
 * MIT License – feel free to reuse in other projects.
 * Copyright (c) 2025 Kosovo Advocacy and Development Center (KADC)
 */

import { MetadataRoute } from "next"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ecohubkosova.com"
  const locales = ["sq", "en"]

  // Static pages with their priorities
  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/marketplace", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/knowledge", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/eco-organizations", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/partners", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/faq", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/how-it-works", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/sustainability", priority: 0.7, changeFrequency: "monthly" as const },
  ]

  // Generate URLs for all static pages in both locales
  const staticUrls: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }))
  )

  // Fetch dynamic listings from database
  // Table name is "tregu_listime" (Albanian for marketplace listings)
  let listingUrls: MetadataRoute.Sitemap = []
  try {
    const supabase = await createServerSupabaseClient()
    const { data: listings } = await supabase
      .from("tregu_listime")
      .select("id, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(500)

    if (listings) {
      listingUrls = listings.flatMap((listing) =>
        locales.map((locale) => ({
          url: `${baseUrl}/${locale}/marketplace/${listing.id}`,
          lastModified: listing.created_at ? new Date(listing.created_at) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        }))
      )
    }
  } catch (error) {
    console.error("Error fetching listings for sitemap:", error)
  }

  // Fetch knowledge articles
  // Table name is "artikuj" (Albanian for articles)
  let articleUrls: MetadataRoute.Sitemap = []
  try {
    const supabase = await createServerSupabaseClient()
    const { data: articles } = await supabase
      .from("artikuj")
      .select("id, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(200)

    if (articles) {
      articleUrls = articles.flatMap((article) =>
        locales.map((locale) => ({
          url: `${baseUrl}/${locale}/knowledge/${article.id}`,
          lastModified: article.created_at ? new Date(article.created_at) : new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.5,
        }))
      )
    }
  } catch (error) {
    console.error("Error fetching articles for sitemap:", error)
  }

  // Fetch organizations
  let organizationUrls: MetadataRoute.Sitemap = []
  try {
    const supabase = await createServerSupabaseClient()
    const { data: organizations } = await supabase
      .from("organizations")
      .select("id, created_at")
      .order("created_at", { ascending: false })
      .limit(200)

    if (organizations) {
      organizationUrls = organizations.flatMap((org) =>
        locales.map((locale) => ({
          url: `${baseUrl}/${locale}/eco-organizations/${org.id}`,
          lastModified: org.created_at ? new Date(org.created_at) : new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.5,
        }))
      )
    }
  } catch (error) {
    console.error("Error fetching organizations for sitemap:", error)
  }

  return [...staticUrls, ...listingUrls, ...articleUrls, ...organizationUrls]
}
