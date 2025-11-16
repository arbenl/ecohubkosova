import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-provider"
import ErrorBoundary from "@/components/error-boundary" // Import the ErrorBoundary component
import "./globals.css"
import type { Metadata } from "next"

// Initialize next-intl by importing config
import '../../i18n'

export const dynamic = "force-dynamic"

const inter = { className: "font-sans" }

export const metadata: Metadata = {
  title: "ECO HUB KOSOVA | Lidhu. Bashkëpuno. Krijo Qarkullim.",
  description:
    "Platforma e parë e ekonomisë qarkulluese në Kosovë. Lidhu me partnerë, zbulo mundësi dhe krijo qarkullim të qëndrueshëm.",
  keywords: ["ekonomi qarkulluese", "Kosovë", "qëndrueshmëri", "rrjetëzim", "treg", "bashkëpunim"],
  authors: [{ name: "Koalicioni i Ekonomisë Qarkulluese" }],
  openGraph: {
    title: "ECO HUB KOSOVA | Lidhu. Bashkëpuno. Krijo Qarkullim.",
    description:
      "Platforma e parë e ekonomisë qarkulluese në Kosovë. Lidhu me partnerë, zbulo mundësi dhe krijo qarkullim të qëndrueshëm.",
    url: "https://ecohubkosova.com",
    siteName: "ECO HUB KOSOVA",
    locale: "sq-XK",
    type: "website",
  },
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Simplified for testing - getServerUser call deferred to auth provider
  const initialUser = null

  return (
    <html lang="sq" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ErrorBoundary>
            <AuthProvider initialUser={initialUser}>
              {children}
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
