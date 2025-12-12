/**
 * EcoHub Kosova – JSON-LD Structured Data Components
 * MIT License – feel free to reuse in other projects.
 * Copyright (c) 2025 Kosovo Advocacy and Development Center (KADC)
 *
 * These components generate Schema.org structured data for SEO.
 * Include them in your pages to enable rich search results.
 */

import Script from "next/script"

const SITE_NAME = "EcoHub Kosova"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ecohubkosova.com"

/**
 * Organization schema for the main site
 */
export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    description:
      "Platforma e ekonomisë qarkore për Kosovën - The circular economy platform for Kosovo",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      "https://www.facebook.com/kadckosovo",
      "https://www.instagram.com/kadckosovo",
      "https://www.linkedin.com/company/kadc-kosovo",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Prishtina",
      addressRegion: "Kosovo",
      addressCountry: "XK",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "info@ecohubkosova.com",
      availableLanguage: ["Albanian", "English"],
    },
  }

  return (
    <Script
      id="organization-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

/**
 * Website schema with search action
 */
export function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/sq/marketplace?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  return (
    <Script
      id="website-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface ListingJsonLdProps {
  id: string
  title: string
  description: string
  images?: string[]
  price?: number
  currency?: string
  category?: string
  condition?: string
  sellerName?: string
  location?: string
  datePosted?: string
}

/**
 * Product/Listing schema for marketplace items
 */
export function ListingJsonLd({
  id,
  title,
  description,
  images = [],
  price,
  currency = "EUR",
  category,
  condition,
  sellerName,
  location,
  datePosted,
}: ListingJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description,
    image: images.length > 0 ? images : undefined,
    url: `${SITE_URL}/sq/marketplace/${id}`,
    category,
    itemCondition:
      condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    offers:
      price !== undefined
        ? {
            "@type": "Offer",
            priceCurrency: currency,
            price: price,
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            availability: "https://schema.org/InStock",
            seller: sellerName
              ? {
                  "@type": "Organization",
                  name: sellerName,
                }
              : undefined,
          }
        : undefined,
    ...(location && {
      availableAtOrFrom: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: location,
          addressCountry: "XK",
        },
      },
    }),
    ...(datePosted && { datePosted }),
  }

  return (
    <Script
      id={`listing-jsonld-${id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface ArticleJsonLdProps {
  id: string
  title: string
  description: string
  image?: string
  authorName?: string
  datePublished?: string
  dateModified?: string
  category?: string
}

/**
 * Article schema for knowledge base items
 */
export function ArticleJsonLd({
  id,
  title,
  description,
  image,
  authorName,
  datePublished,
  dateModified,
  category,
}: ArticleJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: image ? [image] : undefined,
    url: `${SITE_URL}/sq/knowledge/${id}`,
    datePublished,
    dateModified: dateModified || datePublished,
    author: authorName
      ? {
          "@type": "Person",
          name: authorName,
        }
      : {
          "@type": "Organization",
          name: SITE_NAME,
        },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/sq/knowledge/${id}`,
    },
    ...(category && { articleSection: category }),
  }

  return (
    <Script
      id={`article-jsonld-${id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface OrganizationProfileJsonLdProps {
  id: string
  name: string
  description?: string
  logo?: string
  website?: string
  email?: string
  phone?: string
  location?: string
}

/**
 * LocalBusiness/Organization schema for partner organizations
 */
export function OrganizationProfileJsonLd({
  id,
  name,
  description,
  logo,
  website,
  email,
  phone,
  location,
}: OrganizationProfileJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    description,
    url: website || `${SITE_URL}/sq/eco-organizations/${id}`,
    logo,
    ...(email && { email }),
    ...(phone && { telephone: phone }),
    ...(location && {
      address: {
        "@type": "PostalAddress",
        addressLocality: location,
        addressCountry: "XK",
      },
    }),
  }

  return (
    <Script
      id={`org-jsonld-${id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface BreadcrumbItem {
  name: string
  url: string
}

/**
 * BreadcrumbList schema for navigation
 */
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  }

  return (
    <Script
      id="breadcrumb-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface FAQItem {
  question: string
  answer: string
}

/**
 * FAQPage schema for FAQ pages
 */
export function FAQJsonLd({ items }: { items: FAQItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  return (
    <Script
      id="faq-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
