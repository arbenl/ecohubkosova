import type React from "react"
import { NextIntlClientProvider } from 'next-intl'
import { getMessagesForLocale } from '@/lib/messages'

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  const messages = await getMessagesForLocale(locale)

  // Provide default empty messages if loading fails
  const safeMessages = messages || {}

  return (
    <NextIntlClientProvider locale={locale} messages={safeMessages}>
      {children}
    </NextIntlClientProvider>
  )
}
