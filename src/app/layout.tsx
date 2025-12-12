import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import ErrorBoundary from "@/components/error-boundary" // Import the ErrorBoundary component
import { SkipToContent } from "@/components/accessibility/skip-to-content"
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/seo/json-ld"
import "./globals.css"
import "../lib/unhandled-rejection-logger"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

const inter = { className: "font-sans" }

export const metadata: Metadata = {
  title: "ECO HUB KOSOVA | Lidhu. Bashkëpuno. Krijo Qarkullim.",
  description:
    "Platforma e parë e ekonomisë qarkore në Kosovë. Lidhu me partnerë, zbulo mundësi dhe krijo qarkullim të qëndrueshëm.",
  keywords: ["ekonomi qarkore", "Kosovë", "qëndrueshmëri", "rrjetëzim", "treg", "bashkëpunim"],
  authors: [{ name: "Koalicioni i Ekonomisë Qarkore" }],
  openGraph: {
    title: "ECO HUB KOSOVA | Lidhu. Bashkëpuno. Krijo Qarkullim.",
    description:
      "Platforma e parë e ekonomisë qarkore në Kosovë. Lidhu me partnerë, zbulo mundësi dhe krijo qarkullim të qëndrueshëm.",
    url: "https://ecohubkosova.com",
    siteName: "ECO HUB KOSOVA",
    locale: "sq-XK",
    type: "website",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sq" suppressHydrationWarning>
      <head>
        {/* PWA meta tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0fbf8c" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EcoHub Kosova" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

        {/* Global structured data for search engines */}
        <OrganizationJsonLd />
        <WebsiteJsonLd />
      </head>
      <body className={inter.className}>
        <SkipToContent />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <main id="main-content">{children}</main>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
