import type React from "react"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { AuthProvider } from "@/lib/auth-provider"
import { locales } from "@/lib/locales"
import { LocaleLangSync } from "@/components/locale-lang-sync"

type Props = Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  // Enable static rendering
  setRequestLocale(locale)

  const messages = await getMessages({ locale })

  // Provide intl context for client components
  return (
    <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
      <LocaleLangSync />
      <AuthProvider initialUser={null}>{children}</AuthProvider>
    </NextIntlClientProvider>
  )
}
