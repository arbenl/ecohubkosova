import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import ErrorBoundary from "@/components/error-boundary" // Import the ErrorBoundary component
import "./globals.css"
import type { Metadata } from "next"

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
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sq" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
