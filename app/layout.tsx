import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-provider"
import "./globals.css"
import type { Metadata } from "next"

const inter = Inter({ subsets: ["latin", "latin-ext"] })

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sq">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
