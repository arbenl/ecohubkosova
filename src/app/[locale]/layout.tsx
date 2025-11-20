import type React from "react"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { AuthProvider } from "@/lib/auth-provider"
import { locales } from "@/lib/locales"

type Props = Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  const messages = await getMessages({ locale })

  // Provide intl context for client components
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider initialUser={null}>{children}</AuthProvider>
    </NextIntlClientProvider>
  )
}
