/**
 * EcoHub Kosova – SEO Metadata Utilities
 * MIT License – feel free to reuse in other projects.
 * Copyright (c) 2025 Kosovo Advocacy and Development Center (KADC)
 */

import { Metadata } from "next"

type PageMetadataParams = {
  title: string
  description: string
  path: string
  locale: string
  image?: string
  type?: "website" | "article"
  publishedTime?: string
  modifiedTime?: string
  author?: string
  noIndex?: boolean
}

const SITE_NAME = "EcoHub Kosova"
const DEFAULT_IMAGE = "/og-default.jpg"

/**
 * Generate comprehensive metadata for a page including OpenGraph and Twitter cards.
 * Use this in generateMetadata functions for all public pages.
 *
 * @example
 * export async function generateMetadata({ params }: Props): Promise<Metadata> {
 *   const { locale } = await params
 *   const t = await getTranslations({ locale, namespace: 'marketplace' })
 *
 *   return generatePageMetadata({
 *     title: t('pageTitle'),
 *     description: t('pageDescription'),
 *     path: '/marketplace',
 *     locale,
 *   })
 * }
 */
export function generatePageMetadata({
  title,
  description,
  path,
  locale,
  image = DEFAULT_IMAGE,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  noIndex = false,
}: PageMetadataParams): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ecohubkosova.com"
  const url = `${baseUrl}/${locale}${path}`
  const imageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
      languages: {
        sq: `${baseUrl}/sq${path}`,
        en: `${baseUrl}/en${path}`,
      },
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: locale === "sq" ? "sq_XK" : "en_US",
      alternateLocale: locale === "sq" ? "en_US" : "sq_XK",
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  }
}

/**
 * Generate metadata for a listing/product page.
 * Uses "website" type since Next.js OpenGraph doesn't support "product".
 */
export function generateListingMetadata({
  title,
  description,
  path,
  locale,
  image,
  price,
  currency = "EUR",
}: PageMetadataParams & {
  price?: number
  currency?: string
}): Metadata {
  const metadata = generatePageMetadata({
    title,
    description,
    path,
    locale,
    image,
    type: "website",
  })

  return {
    ...metadata,
    other: {
      "product:price:amount": price?.toString() || "0",
      "product:price:currency": currency,
    },
  }
}

/**
 * Generate metadata for an article/knowledge page.
 */
export function generateArticleMetadata({
  title,
  description,
  path,
  locale,
  image,
  publishedTime,
  modifiedTime,
  author,
}: PageMetadataParams): Metadata {
  return generatePageMetadata({
    title,
    description,
    path,
    locale,
    image,
    type: "article",
    publishedTime,
    modifiedTime,
    author,
  })
}
